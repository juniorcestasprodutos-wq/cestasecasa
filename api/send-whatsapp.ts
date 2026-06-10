import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ftrgcqdbwljfjeyddger.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cmdjcWRid2xqZmpleWRkZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTAxMDksImV4cCI6MjA5NjE4NjEwOX0.7yYz8dFCGIhyp1BPz_Xy_A-yfJh1WB810pVP7R7kONo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { phone, message, template, pixCode } = req.body;
    const cleanedPhone = phone.replace(/\D/g, '');
    const formattedPhone = (cleanedPhone.length <= 11 && !cleanedPhone.startsWith('55')) ? `55${cleanedPhone}` : cleanedPhone;

    try {
        const { data: config, error: configError } = await supabase
            .from('config')
            .select('*')
            .eq('id', 'default')
            .single();

        if (configError || !config || !config.whatsapp_api_token || !config.whatsapp_phone_number_id) {
            return res.status(400).json({ error: "WhatsApp API não configurada." });
        }

        const baseUrl = config.whatsapp_base_url || "https://evolution-api-production-8ad2.up.railway.app";
        const instanceName = config.whatsapp_phone_number_id;
        const apiKey = config.whatsapp_api_token;

        let textToSend = message;
        let secondTextToSend = pixCode || null;

        if (template && template.name) {
            const tName = template.name;
            const params = template.components?.[0]?.parameters?.map((p: any) => p.text) || [];
            
            if (tName === 'obrigadopagamentoo') {
                textToSend = `Olá ${params[0] || 'Cliente'}!\nRecebemos o seu pagamento no valor de R$ ${params[1]}.\nMuito obrigado!`;
            } else if (tName === 'aviso_de_vencimento') {
                textToSend = `Olá ${params[0] || 'Cliente'}!\nLembrando que hoje é o vencimento da parcela da sua compra no valor de R$ ${params[2]}.\n\nSegue abaixo o PIX Copia e Cola para pagamento:`;
                if (!secondTextToSend && params[3]) {
                    secondTextToSend = params[3];
                }
            }
        }

        const url = `${baseUrl}/message/sendText/${instanceName}`;
        
        // 1. Enviar mensagem principal
        const response = await axios.post(
            url,
            { number: formattedPhone, text: textToSend || "Mensagem automática" },
            { headers: { 'apikey': apiKey, 'Content-Type': 'application/json' } }
        );

        // 2. Enviar segundo balão (Código PIX) se solicitado
        if (secondTextToSend) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await axios.post(
                url,
                { number: formattedPhone, text: secondTextToSend },
                { headers: { 'apikey': apiKey, 'Content-Type': 'application/json' } }
            ).catch(err => console.error("Erro no follow-up:", err.response?.data || err.message));
        }

        // --- Registro no Histórico do Chat ---
        try {
            const { data: client } = await supabase
                .from('clients')
                .select('id')
                .ilike('phone', `%${formattedPhone.slice(-8)}%`)
                .single();

            const logEntry = {
                phone: formattedPhone,
                message: textToSend,
                direction: 'outbound' as const,
                client_id: client?.id || null
            };

            await supabase.from('whatsapp_messages').insert(logEntry);

            if (secondTextToSend) {
                await supabase.from('whatsapp_messages').insert({
                    phone: formattedPhone,
                    message: `*Copia e Cola PIX:* \n\n${secondTextToSend}`,
                    direction: 'outbound',
                    client_id: client?.id || null
                });
            }
        } catch (logErr) {
            console.error("Erro ao registrar no log:", logErr);
        }
        // -------------------------------------

        res.json({ status: "ok", data: response.data });
    } catch (error: any) {
        const metaError = error.response?.data?.error || { message: error.message };
        console.error("WhatsApp Error Log:", JSON.stringify(metaError, null, 2));
        res.status(500).json({ 
            error: "Erro na API do WhatsApp", 
            message: metaError.message,
            details: metaError
        });
    }
}

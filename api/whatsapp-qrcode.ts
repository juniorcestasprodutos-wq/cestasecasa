import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ftrgcqdbwljfjeyddger.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0cmdjcWRid2xqZmpleWRkZ2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2MTAxMDksImV4cCI6MjA5NjE4NjEwOX0.7yYz8dFCGIhyp1BPz_Xy_A-yfJh1WB810pVP7R7kONo';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: any, res: any) {
    if (req.method === 'DELETE') {
        try {
            const { data: config } = await supabase.from('config').select('*').eq('id', 'default').single();
            const url = `${config.whatsapp_base_url}/instance/logout/${config.whatsapp_phone_number_id}`;
            await axios.delete(url, { headers: { 'apikey': config.whatsapp_api_token } }).catch(() => {});
            return res.json({ status: 'ok', message: 'Instância desconectada' });
        } catch (error: any) {
            return res.status(500).json({ error: 'Erro ao resetar instância' });
        }
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { data: config, error: configError } = await supabase
            .from('config')
            .select('*')
            .eq('id', 'default')
            .single();

        if (configError || !config) {
            return res.status(500).json({ error: "Configuração não encontrada no banco de dados" });
        }

        const whatsappApiToken = config.whatsapp_api_token;
        const whatsappPhoneNumberId = config.whatsapp_phone_number_id;
        const whatsappBaseUrl = config.whatsapp_base_url;

        if (!whatsappApiToken || !whatsappPhoneNumberId || !whatsappBaseUrl) {
            return res.status(400).json({ error: "Evolution API não configurada." });
        }

        const url = `${whatsappBaseUrl}/instance/connect/${whatsappPhoneNumberId}`;
        const response = await axios.get(url, {
            headers: { 'apikey': whatsappApiToken }
        });
        
        res.json(response.data);
    } catch (error: any) {
        const isNotFound = error.response?.status === 404 || error.response?.data?.status === 404 || JSON.stringify(error.response?.data || '').includes('does not exist');
        
        if (isNotFound) {
            // Instância não existe, vamos criar
            try {
                const { data: config } = await supabase.from('config').select('*').eq('id', 'default').single();
                const createUrl = `${config.whatsapp_base_url}/instance/create`;
                const createResponse = await axios.post(createUrl, {
                    instanceName: config.whatsapp_phone_number_id,
                    qrcode: true,
                    integration: "WHATSAPP-BAILEYS"
                }, {
                    headers: { 'apikey': config.whatsapp_api_token }
                });
                
                return res.json({ 
                    base64: createResponse.data?.qrcode?.base64 || createResponse.data?.qrcode, 
                    instance: createResponse.data?.instance 
                });
            } catch (createError: any) {
                console.error("Evolution API Create Error:", createError.response?.data || createError.message);
                return res.status(500).json({ error: "Erro ao criar instância no Evolution API", details: createError.response?.data });
            }
        }
        
        console.error("Evolution API Connect Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Erro ao buscar QR Code", details: error.response?.data });
    }
}

declare module 'mercadopago' {
    export interface MercadoPagoConfig {
        configure: (options: { access_token: string }) => void;
    }

    const mercadopago: {
        configure: (options: { access_token: string }) => void;
        preferences: {
            create: (preferenceData: any) => Promise<any>;
        };
        payment: any;
    };

    const mercadopago: MercadoPagoConfig;
    export default mercadopago;
}
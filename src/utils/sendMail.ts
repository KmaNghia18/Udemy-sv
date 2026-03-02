import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
import puppeteer, { Browser } from 'puppeteer';

interface EmailOptions {
    email: string;
    subject: string;
    template: string;
    data: { [key: string]: any };
}

// Tạo transporter dùng chung, tránh lặp code
const createTransporter = (): Transporter => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        secure: false,
        port: parseInt(process.env.SMTP_PORT || '587'),
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

export const sendMail = async (options: EmailOptions): Promise<void> => {
    const transporter = createTransporter();
    const { email, subject, template, data } = options;

    // Đưa PATH vào tệp mẫu email
    const templatePath = path.join(__dirname, '../mails', template);

    // Hiển thị mẫu email với EJS
    const html: string = await ejs.renderFile(templatePath, data);

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject,
        html
    };

    await transporter.sendMail(mailOptions);
};

export const sendMailCertificate = async (options: EmailOptions): Promise<void> => {
    let browser: Browser | null = null;

    try {
        browser = await puppeteer.launch({ headless: true });
        const [page] = await browser.pages();
        const transporter = createTransporter();

        const { email, subject, template, data } = options;

        // Đưa PATH vào tệp mẫu email
        const templatePath = path.join(__dirname, '../mails', template);

        // Hiển thị mẫu email với EJS
        const html: string = await ejs.renderFile(templatePath, data);

        await page.setContent(html);

        const pdf = await page.pdf({
            format: "A4",
            printBackground: true,
        });

        const mailOptions = {
            from: process.env.SMTP_MAIL,
            to: email,
            subject,
            html,
        };

        await transporter.sendMail({
            ...mailOptions,
            attachments: [
                {
                    filename: 'send-certification.pdf',
                    content: Buffer.from(pdf),
                    contentType: 'application/pdf',
                    headers: {
                        "Content-Disposition": "attachment; filename=send-certification.pdf"
                    }
                }
            ]
        });
    } finally {
        if (browser) await browser.close();
    }
};

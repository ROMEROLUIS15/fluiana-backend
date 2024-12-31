const generateEmailTemplate = (code: string, username?: string): string => {
    return `
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Helvetica, Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f0f2f5;
                color: #1c1e21;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 20px;
            }
            h1 {
                font-size: 18px;
                font-weight: normal;
                margin-bottom: 20px;
            }
            p {
                font-size: 14px;
                line-height: 1.5;
                margin: 0 0 15px;
            }
            .code {
                font-size: 24px;
                font-weight: bold;
                color: #fbfcfa;
                background-color: #216e4b;
                padding: 10px;
                border-radius: 4px;
                display: inline-block;
                margin: 10px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <h1>${username ? `Hello, ${username}:` : 'Hello:'}</h1>
            <p>We received a request to reset your Fluiana password.</p>
            <p>Enter the following code to reset the password:</p>
            <div class="code">${code}</div>
            
            <p>Did you not request this change?<br>
            If you did not request a new password, <a href="#">let us know</a>.</p>
            <br>
            <p>from Fluiana</p>
        </div>
    </body>
    </html>
    `;
}

export default generateEmailTemplate;

from flask import current_app
from flask_mail import Mail, Message
from threading import Thread

mail = Mail()

def send_async_email(app, msg):
    with app.app_context():
        mail.send(msg)

def send_password_reset_email(email, reset_link):
    try:
        msg = Message(
            subject='BrightFold: Reset Password',
            recipients=[email],
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            html=f"""
            <html>
                <body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
                    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                        <h2 style='color: #2563eb;'>Reset Your Password</h2>
                        <p>We received a request to reset your password.</p>
                        <p>If you did not make this request, you can safely ignore this message.</p>
                        <p>Otherwise, click the link below to reset your password:</p>
                        <div style='text-align: center; margin: 30px 0;'>
                            <a href='{reset_link}' 
                               style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                                Reset Password
                            </a>
                        </div>
                        <p>This link will expire in 1 hour.</p>
                        <p>Best regards,<br>The BrightFold Team</p>
                    </div>
                </body>
            </html>
            """
        )
        Thread(
            target=send_async_email,
            args=(current_app._get_current_object(), msg)
        ).start()
        return True
    except Exception as e:
        print(f"Failed to send email: {str(e)}")
        return False 
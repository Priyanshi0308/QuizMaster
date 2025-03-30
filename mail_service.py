# from email.mime.multipart import MIMEMultipart
# from email.mime.text import MIMEText
# import smtplib
# from jinja2 import Template

# SMTP_SERVER = "localhost"
# SMTP_PORT = 1025
# SENDER_EMAIL = "pk@study"
# SENDERPASSWORD = ''

# def send_email(to, subject, content_body):
#     msg = MIMEMultipart()
#     msg["TO"] = to
#     msg["SUBJECT"] = subject
#     msg["FROM"] = SENDER_EMAIL
#     msg.attach(MIMEText(content_body, 'html'))

#     client = smtplib.SMTP(host=SMTP_SERVER, port=SMTP_PORT)
#     client.send_message(msg=msg)
#     client.quit()

# send_email('pk@iitm.ac.in', 'there is the sub', '<h1> test 01 </h1>')

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication


SMTP_SERVER_HOST="localhost"
SMTP_SERVER_PORT=1025
SENDER_ADDRESS='pk@gmail.com'
SENDER_PASSWORD=''

# def send_mail(to,sub,message,file=None):
#     mail_mgs=MIMEMultipart()
#     mail_mgs['From']=SENDER_ADDRESS
#     mail_mgs['To']=to
#     mail_mgs['Subject']=sub
    
#     mail_mgs.attach(MIMEText(message,"html"))

#     if not file==None:
#         with open(file, 'rb') as f:
#             attach = MIMEApplication(f.read(), _subtype='zip')
#             attach.add_header('Content-Disposition', 'attachment', filename=file)
#             mail_mgs.attach(attach)
    
#     smtp=smtplib.SMTP(host=SMTP_SERVER_HOST,port=SMTP_SERVER_PORT)
#     smtp.login(SENDER_ADDRESS,SENDER_PASSWORD)
#     smtp.send_message(mail_mgs)
#     smtp.quit()
#     return True

def send_mail(to, sub, message, file=None):
    mail_mgs = MIMEMultipart()
    mail_mgs['From'] = SENDER_ADDRESS
    mail_mgs['To'] = to
    mail_mgs['Subject'] = sub
    
    mail_mgs.attach(MIMEText(message, "html"))

    
    if file and os.path.exists(file):
        with open(file, 'rb') as f:
            attach = MIMEApplication(f.read(), _subtype='zip')
            attach.add_header('Content-Disposition', 'attachment', filename=os.path.basename(file))
            mail_mgs.attach(attach)

    smtp = smtplib.SMTP(host=SMTP_SERVER_HOST, port=SMTP_SERVER_PORT)
    smtp.send_message(mail_mgs)
    smtp.quit()
    return True
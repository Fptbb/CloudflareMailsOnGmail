const isJson = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const { headers } = request;

      const contentType = headers.get('content-type') || '';

      if (headers.get('Authorization') === env.AUTH) {
        if (contentType.includes('text/html') || contentType.includes('text/plain')) {
          const body = await request.text()
          const { data } = Object.fromEntries(headers)

          if (data && isJson(data)) {
            let emailData = JSON.parse(data)
            // Documentation at: https://api.mailchannels.net/tx/v1/documentation
            let to = emailData.email.filter(x => !x.type || x.type === undefined || x.type === 'normal' || x.type === 'to')
            let cc = emailData.email.filter(x => x.type === 'cc')
            let bcc = emailData.email.filter(x => x.type === 'bcc')

            let request_data = {
              method: 'POST',
              headers: {
                'content-type': 'application/json',
              },
              body: JSON.stringify({
                personalizations: [
                  {
                    to, cc, bcc
                  },
                ],
                from: {
                  email: env.MAIL,
                  name: env.NAME,
                },
                subject: emailData.subject,
                to,
                content: [
                  {
                    type: contentType,
                    value: body,
                  },
                ],
              }),
            }
            let send_request = await new Request('https://api.mailchannels.net/tx/v1/send', request_data);
            const request_response = await fetch(send_request);
            return new Response('Email sent!', {
              status: 418
            });
          } else {
            return new Response('You are missing something here!', {
              status: 400
            });
          }
        } else {
          return new Response('Invalid Type!', {
            status: 415
          });
        }
      } else {
        return new Response('Don\'t be curious!');
      }
    } else {
      return new Response('Don\'t be curious!')
    }
  }
};
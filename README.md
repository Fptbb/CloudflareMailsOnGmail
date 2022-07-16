# Cloudflare/Mailchannels Gmail Integration

Make possible to use cloudflare workers to send emails from gmail interface, adds a button to the gmail compose interface

## Deployment

To deploy this project, create a project in cloudlare workers, using wrangler or uploading the code itself on the site, add the three environment variables described in the .env.exemple on the worker.
After this, the server side part of the project is already working, you can test it by using any client with this curl, just replacing the endpoint of the api, the password, and the other details about the email.

```curl
  curl --request POST \
  --url https://yourworker.api.com/ \
  --header 'Authorization: YourAuthPassword' \
  --header 'Content-Type: text/html;charset=UTF-8' \
  --header 'data: {"email":[{"email":"yourEmail@exemple.com", "name": "Fptbb"}],"subject":"Test Email"}' \
  --data OK
```

After that, the only thing that need to be done, is add the client script on your preferred extension and edit the variables at the first lines.
And is all done here 🎉

## Environment Variables

To run this project, you will need to add the following environment variables to your worker

`MAIL` = your_mail@exemple.com
`AUTH` = A Strong Password For Auth
`NAME` = Your Name/Service Name

## Run Locally

Just don't, the system requires that you run it on cloudflare servers, otherwise you be rejected.

## Usage/Examples

You will see a button on the compose page of the gmail, on the dropdown of the send button, named "Webhook Send", click and your email will be sent.

## Support

For support, try to fix it yourself, sorry, almost no support, you are on your own now, be careful.

## Authors

- [@fptbb](https://www.github.com/fptbb) - Main, Serverside, Clientside, Ideia
- [@yHasteeD](https://github.com/yHasteeD) - Clientside, Parts that the Main is Lazy

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Steps to start with Rentify Frontend (https://github.com/al1216/rentify-frontend/)

1. clone the repo
2. create a .env file with **REACT_APP_HOST = http://localhost:4000**
3. to install **node_modules**, run **npm install** in terminal
4. then start the app with **npm start**

## Steps to start with Rentify Backend (https://github.com/al1216/rentify-backend)

1. clone the repo
2. create a .env file with **SERVER_PORT = 4000** ,add also your own mongo-db url like **MONGODB_URL = your-link**, **JWT_SECRET = any-number**, **EMAIL = your-email**, and **PASS = your-pass**
3. to install **node_modules**, run **npm install** in terminal
4. then start the server use **node index.js** or **nodemon index.js**


* Note - **EMAIL** is required by nodemailer as source email to send emails to customer/seller, further we also need a **PASS** (not your Google email account password) but something else, basically a authentication password (follow this stackoverflow link to get our code too - [https://stackoverflow.com/a/49306726/20806907](https://stackoverflow.com/a/49306726/20806907))  

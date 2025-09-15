# pathotec (backend)

## Step 1

run cmd `npm init`

## Step 2

npm i `cookie-parser` (cookie-parser is a middleware for Node.js, commonly used with the Express framework, that simplifies the process of parsing cookies attached to client requests. It makes it easier to access and manipulate cookie data within your application.)
`cors` (
Cross-Origin Resource Sharing (CORS) in Node.js is a mechanism that allows web applications running at one origin (domain, scheme, or port) to make requests to resources from a different origin. This is a crucial security feature implemented by web browsers to enforce the "same-origin policy," which by default restricts cross-origin HTTP requests.
)
`dotenv` (
The dotenv module in Node.js provides a way to load environment variables from a .env file into process.env. This is particularly useful for managing configuration settings, especially sensitive ones like API keys and database credentials, keeping them separate from your source code.
)
`express` (
Express.js is a minimalist and flexible Node.js web application framework that provides a robust set of features for building web and mobile applications, as well as APIs. It simplifies the development of server-side applications by offering an easy-to-use API for routing, middleware, and HTTP utilities.
)
`mysql2`
`nodemon` (
Nodemon is a utility that enhances the development workflow for Node.js applications by automatically restarting the server whenever changes are detected in the project files. This eliminates the need for manual stopping and restarting of the Node.js application after every code modification.
)
`socket.io`

## Step 3

create `/src` floder create inside create floder 
	`controller`(
		In Node.js, particularly within frameworks like Express.js, a controller is a fundamental component in the Model-View-Controller (MVC) architectural pattern. It acts as an intermediary, handling incoming client requests and orchestrating the application's response.
	)
	`db` 
	`routes` (
		In Node.js, routes define how a web application responds to client requests based on the URL path and HTTP method. While you can implement routing using Node.js's native http module, the Express.js framework simplifies this process significantly.
	)
	`utils` 
	file create 
	`index.js` (
		index.js is frequently used as the primary entry point for a Node.js application or a specific module within a larger project. When you run node . or npm start (if configured), Node.js often looks for index.js by default in the current directory or specified module.
	)
	`app.js` (
		app.js is commonly used to house the core application logic, especially in web frameworks like Express.js. This includes setting up middleware, defining routes, configuring the server, and connecting to databases.
	)

## Step 4

in package.json some change type or script replace
`"type": "module"`
`    "scripts": {
    "dev": "nodemon -r dotenv/config --experimental-json-modules src/index.js"
  },`

# pathotec (frontend)

## Step 1

run cmd `npx create-next=app@latest pathotec-app`

## Step 2

npm i `axios`(Axios is a popular, open-source, JavaScript library for making HTTP requests from web browsers and Node.js environments, allowing developers to easily fetch and send data to servers. ) `lucide-react` `react-toastify` `socket.io-client`

## Setp 3

create new floder `components`

# nodeJSMapper
Astra Db example with node.js mapper

Create Astra database

At any time if there is some problem you can click on the little chat option at the bottom right corner of the screen, to get help from Astra team.

Go to this URL Astra
Sign up for a new account by adding credentials.



Click on Create database option from Astra UI.


Add the details.
Database name
Keyspace name: this is important, remember this and keep it simple as it will be used in the application.
Choose the desired cloud environment plan from Google cloud, AWS and Microsoft Azure. 
And click on create database.


Wait, it will take some time to create the database.


The database is in pending state when it is being created. After a few seconds the database will be in Active state and ready to use.


Click on the database name. It will move to the database overview. There are various other options like health: maintenance checks information, connect: connecting options, CQL Console: Cassandra query language, and Settings. 
 

Connecting the database through node.js application
Create a simple node.js project. I have created a NodeJS express project.

Research Documents for more information.
blog node.js mapper with apache cassandra
GitHub link

I am using the already created Astra db AstraChatApp with keyspace name astrachatapp.

In the Astra UI dashboard click on the database name and move from overview to connect tab by clicking on the Connect. There are various ways available to connect to the Astra DB.


For Node.js documentation. In the connect using a driver option in the left side panel, Click on Node.js.
Click on Download Bundle as this is a secure bundle which will be used to connect to the database through node.js application. Keep a note of the path to this file.
Follow the instructions to connect.



Node.js application
To generate the Client ID and Client secret:
In the Astra UI click on the Settings tab.
Generate a token by clicking on the Organization settings. Select Role (preferred: Administrator User) and generate a token.

Copy the Client Id, Client Secret and token for future use. You can also download the csv file.
	

Install the npm cassandra driver.
     	npm install cassandra-driver

Create a new mapperExample.js file and create a client by requiring cassandra driver.
    	Here, I had used environment variables to store 
Path_Secure_Connect_Bundle: This is the path where you have stored the “Download Bundle” database_name.zip file.
Client Id and Client Secret: generated on Astra UI as explained before.


const cassandra = require('cassandra-driver')
const client = new cassandra.Client({
   cloud: {
       secureConnectBundle: process.env.PATH_SECURE_CONNECT_BUNDLE
   },
   credentials: {
       username: process.env.CLIENT_ID,
       password: process.env.CLIENT_SECRET
   }
})
 
 

 Create a new mapper. You can create any mapper. Here, I am creating a “User” mapper with keyspace “astrachatapp” and it will have two tables: users and messages
const Mapper = cassandra.mapping.Mapper
const mapper = new Mapper(client, {
   models: {
       'User': {
           keyspace: 'astrachatapp',
           tables: [ 'users','messages'],
           columns: {
               'userid': 'userid',
               'messageid': 'messageid'
           }
       }
   }
})
 

Randomly generating the primary keys by using uuid. 
const Uuid = cassandra.types.Uuid
const messageid = Uuid.random()
const userid = Uuid.random()

Connect to the database.
client.connect()

Then we need to use the database keyspace and perform some queries.
Some of you can get this error while referring to the previous documentation.
error: missing correct permissions.

The previous documentation is based on cassandra node.js driver. As cassandra can be on premises DB in which you have full access to DB and can do anything, but when it comes to cloud there are some restrictions which is known as opinionated control. In this way some access is denied which gives a missing correct permissions error.


Solution:
Create the keyspace by using Astra UI.
Since you are already using the secure bundle, it is connected.
Just write the query to create table along with the keyspace name.
Here,
	astrachatapp.users(attributes)
	
 .then(function () {
   const queries = [
       `CREATE TABLE IF NOT EXISTS astrachatapp.users ( userid uuid, email text, name varchar, password text,
           PRIMARY KEY (userid))`,
       `CREATE TABLE IF NOT EXISTS astrachatapp.messages ( messageid uuid, email text, message text, added_date timestamp,
           PRIMARY KEY (messageid))`
      
   ]
   let p = Promise.resolve();
   // Create the schema executing the queries serially
   queries.forEach(query => p = p.then(() => client.execute(query)));
   return p;
 })

9. CRUD operations can be performed by using the mapper in the following way.

  //Insertion
.then(() => {
   const userMapper = mapper.forModel('User')
   return userMapper.insert({
       userid,
       addedDate: new Date(),
       messageid,
       email: 'rsaini@gmail.com',
       name: 'Rachan',
       password: '12345',
       message: "Hi there! Whats up?"
   })
})
.then(() => {
   const userMapper = mapper.forModel('User');
   // SELECT using table "users"
   return userMapper.find({ userid });
 })
 .then(results => console.log('Obtained message by user id\n', results.first()))
 .then(() => {
   const userMapper = mapper.forModel('User');
   // SELECT using table "messages"
   return userMapper.find({ messageid });
 })
 .then(results => {
   console.log('Obtained user by message id\n', results.first());
   return client.shutdown();
 })
 .catch(function (err) {
   console.error('There was an error', err);
   return client.shutdown().then(() => { throw err; });
 });



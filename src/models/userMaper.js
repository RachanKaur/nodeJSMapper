const cassandra = require('cassandra-driver')
const Mapper = cassandra.mapping.Mapper
const Uuid = cassandra.types.Uuid

const client = new cassandra.Client({
    cloud: {
        secureConnectBundle: process.env.PATH_SECURE_CONNECT_BUNDLE
    },
    credentials: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET
    }
})

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

const messageid = Uuid.random()
const userid = Uuid.random()

client.connect()
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
  .then(results => console.log('Obtained message by id\n', results.first()))
  .then(() => {
    const userMapper = mapper.forModel('User');
    // SELECT using table "user_videos"
    return userMapper.find({ messageid });
  })
  .then(results => {
    console.log('Obtained user by user id\n', results.first());
    return client.shutdown();
  })
  .catch(function (err) {
    console.error('There was an error', err);
    return client.shutdown().then(() => { throw err; });
  });

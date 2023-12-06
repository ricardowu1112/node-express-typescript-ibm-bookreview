import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
      title: 'Canvas Project',
      description: 'By Ricardo Wu'
    },
    host: 'localhost:5000'
  };
  
  const outputFile = './swagger-output.json';
  const routes = ['./router/auth_users.ts', './router/general.ts', './index.ts'];
  
  /* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
  root file where the route starts, such as index.js, app.js, routes.js, etc ... */
  
  swaggerAutogen()(outputFile, routes, doc);
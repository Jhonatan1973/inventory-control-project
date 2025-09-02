export const environment = {
  production: false,
  apiUrl: 'http://10.1.0.45:9090/api',
  //apiUrl: 'http://localhost:9090/api',
  endpoints: {
    auth: '/auth/login',
    users: '/users',
    createUserTable: '/user-tables/create',
    bySector: '/user-tables/by-sector',
    productsBase: '/products-base',
    userTables: '/user-tables',
    historico: '/user-tables/historico/by-sector'
  }
};

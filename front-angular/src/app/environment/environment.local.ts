export const environment = {
  production: false,
  apiUrl: 'http://localhost:9090/api',
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

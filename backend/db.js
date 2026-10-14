import { Pool } from "pg";

const pool = new Pool ({
    user: "postgres",
    password: "sales",
    host: "localhost",
    port: 5432,
    database: "saledb",
    
});

pool.connect()
    .then(client => {
        console.log('✅ PostgreSQL connected successfully!');
        client.release();
    })
    .catch(err => {
        console.error('❌ PostgreSQL connection failed:', err.message);
    });

export default pool;

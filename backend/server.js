const cors = require('cors');

const allowedOrigins = [
  'http://localhost:3000',
  'https://youtube-clone-fullstack.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Pre-flight for all requests
app.options('*', cors());

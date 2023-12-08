import express from "express";
import rateLimit from "express-rate-limit";
import { router } from "./routes.js";
import cors from 'cors';
import cluster from "cluster";
import os from "os";


if (cluster.isMaster) {
  // Fork workers based on the number of CPU cores
  for (let i = 0; i < os.cpus().length; i++) {
    cluster.fork();
  }

  // Handle worker death and restart
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = express();
  app.use(cors());

  // limiting concurrent requests
  const limiter = rateLimit({
    windowMs: 5 * 1000,
    max: 250, // Limit each IP to 25 requests per `window`
    message: {
      code: 429,
      message: 'too many requests'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use(limiter);


  // declaring middleware functions
  // app.use(bodyParser.json({ limit: '10mb' }));
  app.set("view engine", "ejs"); //ejs as templating engine
  // app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static("public")); //static files in public directory

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
      return res.status(200).json({});
    }
    next();
  });

  app.use('/', router);

  const port = 5000;
  app.listen(port, () => {
    console.log(`>> Server ${process.pid} started successfully at port ${port}`);
  });
}


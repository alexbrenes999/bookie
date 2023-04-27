import express from 'express';
import path from 'path';
import db from './config/connection';
import routes from './routes';
import { typeDefs, resolvers } from './schemas';
import { ApolloServer } from 'apollo-server-express';
import { authMiddleware } from './utils/auth';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routes);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  // context: ({ req }) => ({ req })
});

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/public/index.html'));
});

app.use(routes);

const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
})
};

startApolloServer(resolvers, typeDefs);
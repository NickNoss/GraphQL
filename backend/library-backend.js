const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const Book = require('./models/book')
const Author = require('./models/author')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const User = require('./models/user')

const typeDefs = `
type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

type Token {
    value: String!
  }

extend type Query {
    me: User
  }

extend type Mutation {
    createUser(
      username: String!
      favoriteGenre: String!
    ): User!

    login(
      username: String!
      password: String!
    ): Token
  }

type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allAuthors: [Author!]!
    allBooks(author: String, genre: String): [Book!]!
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
      ): Book!

    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const filter = {}
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (author) filter.author = author._id
      }
      if (args.genre) {
        filter.genres = { $in: [args.genre] }
      }
      return Book.find(filter).populate('author')
    },
    allAuthors: async () => {
      const authors = await Author.find({})
      return Promise.all(
        authors.map(async (author) => {
          const bookCount = await Book.countDocuments({ author: author._id })
          return { ...author.toObject(), bookCount }
        })
      )
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }
      try {
        if (!args.title || args.title.length < 3) {
          throw new GraphQLError('Kirjan nimi on liian lyhyt', {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args }
          })
        }
        if (!args.author || args.author.length < 3) {
          throw new GraphQLError('Kirjailijan nimi on liian lyhyt', {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args }
          })
        }

        let author = await Author.findOne({ name: args.author })
        if (!author) {
          author = new Author({ name: args.author })
          await author.save()
        }

        const book = new Book({
          title: args.title,
          published: args.published,
          genres: args.genres,
          author: author._id
        })

        await book.save()
        return book.populate('author')
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError('Kirjan tiedot ei kelpaa', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
              error: error.message
            }
          })
        }
        throw error
      }
    },
    editAuthor: async (root, args) => {
      try {
        const author = await Author.findOne({ name: args.name })
        if (!author) return null

        if (args.setBornTo && typeof args.setBornTo !== 'number') {
          throw new GraphQLError('Syntymävuoden on oltava numero', {
            extensions: { code: 'BAD_USER_INPUT', invalidArgs: args }
          })
        }

        author.born = args.setBornTo
        await author.save()
        return author
      } catch (error) {
        if (error.name === 'ValidationError') {
          throw new GraphQLError('Kirjailijan tiedot ei kelpaa', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
              error: error.message
            }
          })
        }
        throw error
      }
    },
    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre
      })
      return user.save().catch(error => {
        throw new GraphQLError('Käyttäjän luonti epäonnistui', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args,
            error
          }
        })
      })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== 'salasana') { 
        throw new GraphQLError('Käyttäjätunnus tai salasana on väärin', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

    const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, 'nopeestialkuun') }
    }
  }
}

require('dotenv').config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const MONGODB_URI = process.env.MONGODB_URI
console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.error('error connection to MongoDB:', error.message)
  })

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('bearer ')) {
      const decodedToken = jwt.verify(auth.substring(7), 'nopeestialkuun')
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
    return {}
  }
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const Book = require('./models/book')
const Author = require('./models/author')

const typeDefs = `
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
}
,
    allAuthors: async () => {
      const authors = await Author.find({})
      return Promise.all(
        authors.map(async (author) => {
        const bookCount = await Book.countDocuments({ author: author._id })
        return { ...author.toObject(), bookCount }
      })
    )
}

  },
  Mutation: {
    addBook: async (root, args) => {
      // Tarkista löytyykö kirjailija
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        author = new Author({ name: args.author })
        await author.save()
      }

      // Luo kirja ja liitä siihen authorin id
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author: author._id
      })

      await book.save()

      // Populate, jotta GraphQL palauttaa Author-olion eikä vain id:n
      return book.populate('author')
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })

      if (!author) return null

      author.born = args.setBornTo

      await author.save()

      return author
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
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
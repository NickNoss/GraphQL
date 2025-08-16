import { useState } from 'react'
import { useMutation, gql } from '@apollo/client'
import PropTypes from 'prop-types'
import { ALL_AUTHORS } from './Authors'
import { ALL_BOOKS } from './Books'

const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(title: $title, author: $author, published: $published, genres: $genres) {
      title
      author {
        name
        born
      }
      published
      genres
    }
  }
`

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook] = useMutation(ADD_BOOK, {
    update: (cache, { data: { addBook } }) => {
      // Update the cache with the new book
      const { allBooks } = cache.readQuery({ query: ALL_BOOKS }) || { allBooks: [] }
      cache.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: allBooks.concat(addBook) },
      })

      try {
        const { allAuthors } = cache.readQuery({ query: ALL_AUTHORS }) || { allAuthors: [] }
        const authorExists = allAuthors.find(a => a.name === addBook.author)
        if (!authorExists) {
          cache.writeQuery({
            query: ALL_AUTHORS,
            data: { allAuthors: allAuthors.concat({ name: addBook.author, born: addBook.author.born, bookCount: 1 }) },
          })
        }
      } catch (e) {
        console.error("Error updating authors cache:", e)
      }
    }
  })

  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    if (!title || !author || !published || genres.length === 0) {
    alert('Please fill all fields and add at least one genre')
    return
  }
  try {
    await addBook({
      variables: {
        title,
        author,
        published: Number(published),
        genres,
      }
    })
  } catch (error) {
    console.error("Error adding book:", error)
  }

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    if (genre.trim() && !genres.includes(genre.trim())) {
      setGenres(genres.concat(genre.trim()))
      setGenre('')
    }
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}
NewBook.propTypes = {
  show: PropTypes.bool.isRequired,
}
export default NewBook
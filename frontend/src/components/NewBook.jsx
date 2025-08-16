import { useState } from 'react'
import { useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { ALL_AUTHORS } from './Authors'
import { ALL_BOOKS } from '../queries'
import { ADD_BOOK } from '../queries'

const NewBook = (props) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [
      { query: ALL_BOOKS },
      { query: ALL_AUTHORS }
    ],
    onError: (error) => {
      console.error('Error adding book:', error)
    }
  })

  if (!props.show) {
    return null
  }

  const addGenre = () => {
    const trimmedGenre = genre.trim()
    if (trimmedGenre && !genres.includes(trimmedGenre)) {
      setGenres(genres.concat(trimmedGenre))
    }
    setGenre('')
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

      setTitle('')
      setAuthor('')
      setPublished('')
      setGenres([])
      setGenre('')
    } catch (error) {
      console.error("Error adding book:", error)
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
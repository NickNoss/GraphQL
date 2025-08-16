import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { ALL_BOOKS, ALL_GENRES } from '../queries'

const Books = ({ show }) => {
  const [selectedGenre, setSelectedGenre] = useState(null)

  const { loading: booksLoading, error: booksError, data: booksData, refetch } = useQuery(ALL_BOOKS, {
    variables: { genre: selectedGenre },
    fetchPolicy: 'cache-and-network',
  })

  const { loading: genresLoading, error: genresError, data: genresData } = useQuery(ALL_GENRES)

  if (!show) return null
  if (booksLoading || genresLoading) return <div>loading...</div>
  if (booksError || genresError) return <div>Error: {booksError?.message || genresError?.message}</div>

  const books = booksData?.allBooks || []
  const allGenres = genresData?.allGenres || []

  const handleGenreClick = (genre) => {
    setSelectedGenre(genre)
    refetch({ genre })
  }

  return (
    <div>
      <h2>books</h2>

      {selectedGenre && (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}

      <table>
        <thead>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1em' }}>
        <button onClick={() => handleGenreClick(null)}>all genres</button>
        {allGenres.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>
            {genre}
          </button>
        ))}
      </div>
    </div>
  )
}

Books.propTypes = {
  show: PropTypes.bool.isRequired,
}

export default Books

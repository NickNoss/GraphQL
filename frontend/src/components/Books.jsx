// import apollo client and necessary hooks
import { useQuery } from '@apollo/client'
import PropTypes from 'prop-types'
import { useState } from 'react'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  // use the useQuery hook to fetch books
  const { loading, error, data } = useQuery(ALL_BOOKS)

  const [selectedGenre, setSelectedGenre] = useState(null)

  if (!props.show) {
    return null
  }

  if (loading) return <div>loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const books = data.allBooks

  const allGenres = [...new Set(books.flatMap(book => book.genres))]
  const filteredBooks = selectedGenre
    ? books.filter(book => book.genres.includes(selectedGenre))
    : books

  return (
    <div>
      <h2>books</h2>

      {selectedGenre && (
        <p>
          in genre <strong>{selectedGenre}</strong>
        </p>
      )}

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '1em' }}>
        <button onClick={() => setSelectedGenre(null)}>all genres</button>
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
export { ALL_BOOKS }
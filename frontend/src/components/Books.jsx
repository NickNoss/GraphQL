// import apollo client and necessary hooks
import { useQuery, gql } from '@apollo/client'
import PropTypes from 'prop-types'

// GraphQL query to fetch all books
const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      author
      published
      genres
    }
  }
`

const Books = (props) => {
  // use the useQuery hook to fetch books
  const { loading, error, data } = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (loading) return <div>loading...</div>
  if (error) return <div>Error: {error.message}</div>

  const books = data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
Books.propTypes = {
  show: PropTypes.bool.isRequired,
}

export default Books
export { ALL_BOOKS }
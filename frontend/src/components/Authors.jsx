// import apollo client and necessary hooks
import { useQuery, gql } from '@apollo/client'
import PropTypes from 'prop-types'

// GraphQL query to fetch all authors
const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
    }
  }
`

const Authors = (props) => {
  // use the useQuery hook to fetch authors
  const { loading, error, data } = useQuery(ALL_AUTHORS)

  // if the component is not supposed to show, return null
  if (!props.show) {
    return null
  }

  // handle loading and error states
  if (loading) return <div>loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // destructure authors from the fetched data
  const authors = data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

Authors.propTypes = {
  show: PropTypes.bool.isRequired,
}

export default Authors
export { ALL_AUTHORS }
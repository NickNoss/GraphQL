// import apollo client and necessary hooks
import { useQuery, gql, useMutation } from '@apollo/client'
import { useState } from 'react'
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

const SET_BIRTHYEAR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
      bookCount
    }
  }
`

const Authors = (props) => {
  // use the useQuery hook to fetch authors
  const { loading, error, data } = useQuery(ALL_AUTHORS)
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const [editAuthor] = useMutation(SET_BIRTHYEAR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  // if the component is not supposed to show, return null
  if (!props.show) {
    return null
  }

  // handle loading and error states
  if (loading) return <div>loading...</div>
  if (error) return <div>Error: {error.message}</div>

  // destructure authors from the fetched data
  const authors = data.allAuthors

  const submit = async (event) => {
    event.preventDefault()
    if (!name || born === '') {
      alert('Please fill in both name and birth year')
      return
    }
    await editAuthor({
      variables: {
        name,
        setBornTo: Number(born),
      },
    })
    setName('')
    setBorn('')
  }

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

      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <select value={name} onChange={(e) => setName(e.target.value)}>
            <option value="">Select author</option>
            {authors.map((a) => (
              <option key={a.name} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          born
          <input
            type="number"
            value={born}
            onChange={(e) => setBorn(e.target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

Authors.propTypes = {
  show: PropTypes.bool.isRequired,
}

export default Authors
export { ALL_AUTHORS }
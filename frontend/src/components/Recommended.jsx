import { useQuery } from '@apollo/client'
import { ME, ALL_BOOKS } from '../queries';
import PropTypes from "prop-types";

const Recommended = ({ show }) => {
    
    const { loading: loadingUser, error: errorUser, data: userData } = useQuery(ME)
    const favoriteGenre = userData?.me?.favoriteGenre
    console.log('userData:', userData)
    console.log("Favorite Genre:", favoriteGenre)


    const { loading: loadingBooks, error: errorBooks, data: booksData } = useQuery(ALL_BOOKS, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre, 
    fetchPolicy: 'network-only' 
  })

    console.log('booksData:', booksData)
    console.log('books:', booksData?.allBooks)

    if (!show) return null
    if (loadingUser || loadingBooks) return <div>Loading...</div>
    if (errorUser) return <div>Error loading user data: {errorUser.message}</div>
    if (errorBooks) return <div>Error loading books: {errorBooks.message}</div>


    const books = booksData?.allBooks || []


    return (
    <div>
      <h2>Recommendations</h2>
      <p>
        books in your favorite genre <strong>{favoriteGenre}</strong>
      </p>

      {books.length === 0 ? (
        <p>No books found for this genre.</p>
      ) : (
        <table>
          <tbody>
            <tr>
              <th>title</th>
              <th>author</th>
              <th>published</th>
            </tr>
            {books.map((book) => (
              <tr key={book.title}>
                <td>{book.title}</td>
                <td>{book.author.name}</td>
                <td>{book.published}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

Recommended.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default Recommended


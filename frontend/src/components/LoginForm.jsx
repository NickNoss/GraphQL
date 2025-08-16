import { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN } from "../queries";
import PropTypes from "prop-types";

const LoginForm = ({ setToken, setPage }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [login] = useMutation(LOGIN, {
        onError: (error) => {
            console.log(error.graphQLErrors[0].message)
        },
    });

    const submit = async (event) => {
        event.preventDefault()

        const result = await login({ variables: { username, password } });
        if (result.data) {
            const token = result.data.login.value;
            setToken(token);
            localStorage.setItem("library-user-token", token);
            setPage("authors");
        }
    }

    return (
    <div>
      <form onSubmit={submit}>
        <div>
          username <input value={username} onChange={({ target }) => setUsername(target.value)} />
        </div>
        <div>
          password <input type="password" value={password} onChange={({ target }) => setPassword(target.value)} />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  );
};

LoginForm.propTypes = {
  setToken: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
  show: PropTypes.bool
};

export default LoginForm;
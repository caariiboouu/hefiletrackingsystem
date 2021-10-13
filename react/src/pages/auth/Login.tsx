import React from "react";
import { TextField, Button } from "@material-ui/core/";
import { gql, useMutation } from "@apollo/client";
import { Typography } from "@material-ui/core";
import { PostsContext } from "../../Context";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";

import { useFormik } from 'formik';

const validate = (values: { email: string; }) => {
  const errors = { email: "" };

  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  return errors;
};

const MUTATION = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;
const Login = () => {
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validate,
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    },
  });
  const history = useHistory();
  const context = React.useContext(PostsContext);
  const [message, setMessage] = React.useState("");
  const [email, setEmail] = React.useState("");

  const [password, setPassword] = React.useState("");
  const [loginUser] = useMutation(MUTATION);

  const loginF = async () => {
    let dataUser;
    try {
      dataUser = await loginUser({
        variables: {
          email,
          password,
        },
      });
    } catch (e) {
      e.graphQLErrors.some((graphQLError: any) =>
        setMessage(graphQLError.message)
      );
    }
    if (dataUser?.data?.loginUser) {
      setMessage("");
      localStorage.setItem("AUTH_TOKEN", dataUser.data.loginUser.token);
      context.updateUser(dataUser.data.loginUser.user);
      history.push("/");
    }
  };
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      loginF();
    }
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      <>
        <h3>Login</h3>

        <div>
          <TextField
            id="email"
            label="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <TextField
            id="password"
            label="password"
            type={"password"}
            onKeyPress={handleKeyPress}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div style={{ height: "15px" }} />
        <div>
          <Button variant={"outlined"} color={"primary"} onClick={loginF}>
            Login
          </Button>
        </div>

        <div>
          <Link to={"/forgetPassword"}>Forget Password?</Link>
        </div>
        <Typography color={"secondary"}>{message}</Typography>
      </>
    </form>
  );
};
export default Login;

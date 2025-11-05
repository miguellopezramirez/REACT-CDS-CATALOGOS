import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  console.error(error);

  let errorMessage: string;

  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
    errorMessage = (error as any).message;
  }
  else if (typeof error === 'object' && error !== null && 'statusText' in error && typeof (error as any).statusText === 'string') {
    errorMessage = (error as any).statusText;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }


  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{errorMessage}</i>
      </p>
    </div>
  );
}
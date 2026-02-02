
import { testStorage } from './actions';

export default function Page() {
  return (
    <form action={testStorage}>
      <button type="submit">Test Storage</button>
    </form>
  );
}

import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import {
  routeLoader$,
  type DocumentHead,
  routeAction$,
  Form,
  server$,
} from "@builder.io/qwik-city";

interface Joke {
  id: string;
  joke: string;
}

export const useDadJoke = routeLoader$(async () => {
  const res = await fetch("https://icanhazdadjoke.com/", {
    headers: {
      Accept: "application/json",
    },
  });
  return (await res.json()) as Joke;
});

export const useVote = routeAction$((props) => {
  console.log("Vote", props);
});

const Vote = component$(({ id }: { id: string }) => {
  const voteAction = useVote();
  return (
    <Form action={voteAction} class="flex gap-2">
      <input type="hidden" name="jokeID" value={id} />
      <button name="vote" value="up">
        👍
      </button>
      <button name="vote" value="down">
        👎
      </button>
    </Form>
  );
});

export default component$(() => {
  const dadJoke = useDadJoke();
  const isFavoriteSignal = useSignal(false);
  useTask$(({ track }) => {
    track(() => isFavoriteSignal.value);
    console.log("dadJoke client", dadJoke.value);
    server$(() => {
      console.log("dadJoke server", dadJoke.value);
    })();
  });
  return (
    <div class="prose">
      <h1>Are you ready for a joke? 👋</h1>
      <blockquote>{dadJoke.value.joke}</blockquote>
      <button
        onClick$={() => {
          isFavoriteSignal.value = !isFavoriteSignal.value;
        }}
      >
        {isFavoriteSignal.value ? "❤️" : "🤍"}
      </button>
      <Vote id={dadJoke.value.id} />
    </div>
  );
});

export const head: DocumentHead = {
  title: "Dad Jokes",
  meta: [
    {
      name: "description",
      content: "A joke for a day",
    },
  ],
};

<script lang="ts">
  import { onMount } from "svelte";

  let input: string = "";
  onMount(() => {
    console.log('mounted', window);
  });

</script>

<style>
  :host {
    display: block;
    height: calc(100vh - 30);
    overflow: hidden; /* Prevents scrolling outside the component */
  }
</style>

<div class="flex flex-col h-full">
  <div class="flex-grow overflow-auto">
    <p>
      Hey man, look at Marvin's hand. He can't play with his hands like that, and we can't play without him. Nah, I just don't think I'm cut out for music. C'mon. Who is that guy. Yeah, well uh, lets keep this brain melting stuff to ourselves, okay?
    </p>
    <p>
      I'm sure that in 1985, plutonium is available at every corner drug store, but in 1955, it's a little hard to come by. Marty, I'm sorry, but I'm afraid you're stuck here. I can't believe you loaned me a car, without telling me it had a blindspot. I could've been killed. Don't say a word. I need fuel. Go ahead, quick, get in the car. Leave her alone, you bastard.
    </p>
    <p>
      I hope so. This is it. This is the answer. It says here that a bolt of lightning is gonna strike the clock tower precisely at 10:04 p.m. next Saturday night. If we could somehow harness this bolt of lightning, channel it into the flux capacitor, it just might work. Next Saturday night, we're sending you back to the future. Where the hell are they. Yeah well, you shouldn't drink. That's Strickland. Jesus, didn't that guy ever have hair?
    </p>
    <p>
      I'm sure that in 1985, plutonium is available at every corner drug store, but in 1955, it's a little hard to come by. Marty, I'm sorry, but I'm afraid you're stuck here. I can't believe you loaned me a car, without telling me it had a blindspot. I could've been killed. Don't say a word. I need fuel. Go ahead, quick, get in the car. Leave her alone, you bastard.
    </p>
    <p>
      I hope so. This is it. This is the answer. It says here that a bolt of lightning is gonna strike the clock tower precisely at 10:04 p.m. next Saturday night. If we could somehow harness this bolt of lightning, channel it into the flux capacitor, it just might work. Next Saturday night, we're sending you back to the future. Where the hell are they. Yeah well, you shouldn't drink. That's Strickland. Jesus, didn't that guy ever have hair?
    </p>

    <div class="break-words">
      <h1>Example</h1>
      <p>Input: {input}</p>
    </div>    
  </div>

  <div class="bg-blue-400 p-0">
    <!-- This element will always stick to the bottom -->
    <input
      type="text"
      placeholder="Write here"
      maxlength="115"
      bind:value={input}
    />
    <p>I'll just leave this here</p>
  </div>
</div>
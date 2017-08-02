urlr - A URL Shortener Microservice
=========================

**Tired of dealing with unruly, long urls?**

This microservice can shorten those urls for you. Save the `short_url` provided and use it to redirect to your original url any time!

All urls must start with the the protocol `https://` or `http://`

There are two ways to use this microservice:

----------------

## URL Endpoint
Enter a url you would like shortened into your browser as a path of the base domain `https://urlr.glitch.me/new/`

**Example Input**

``https://urlr.glitch.me/new/https://news.google.com``

**Example Output**

`{"original_url":"https://news.google.com/","short_url":"https://urlr.glitch.me/a9"}`


## Form Input
Form input option is available at the landing page [https://urlr.glitch.me/](https://urlr.glitch.me/).

Just enter a url you would like shortened into the form on the landing page.

**Example Input**

`https://news.google.com`

**Example Output**

`{"original_url":"https://news.google.com/","short_url":"https://urlr.glitch.me/a9"}`

----------------

Check out [the landing page](https://urlr.glitch.me/).

Made by [IMBurbank](https://github.com/IMBurbank)
-------------------


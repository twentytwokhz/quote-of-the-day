<p align="center">
  <a href="https://github.com/twentytwokhz/quote-of-the-day">
    <img src="qotd.png" alt="Logo" height=100>
  </a>

  <h3 align="center">Quote of the Day</h3>

  <p align="center">
    An Obsidian plugin to insert random quotes as Markdown.
    <br />
    <br />
    <a href="https://github.com/twentytwokhz/quote-of-the-day/issues">Report a Bug</a>
    ·
    <a href="https://github.com/twentytwokhz/quote-of-the-day/issues">Request a Feature</a>
  </p>
</p>

<!-- ABOUT THE PROJECT -->

## About The Project

This plugin allows you to insert a famous quote in Markdown format. It is relying on an external API that can be changed via settings.

Courtesy to [Sergey Sokurenko](https://github.com/ssokurenko) for providing the default API with the quotes. Thank you!

## Installing

Find this plugin in the listing of community plugins in Obsidian and add it to your application.

Or, if you'd like to install it manually, clone this repository to the `.obsidian/plugins/` directory in your vault, navigate to your newly cloned folder, run `npm i` or `yarn` to install dependencies, and run `npm run build` or `yarn build` to compile the plugin.

<!-- USAGE EXAMPLES -->

## Options

You can customize the source API from which the plugin retrieves the quotes.
Currently it requires the response object to contain an `author` and a `text` property.

### Quote API Url

This is the API URL from which the plugin will retrieve the list of quotes.

`Expected quote format`

```json
{
  "text": "lorem ipsum",
  "author": "John Doe"
}
```

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

This project is licensed under the MIT License - see the [ `LICENSE` ](LICENSE) file for details

<!-- CONTACT -->

## Contact

Florin Bobis - [@twentytwokhz](https://github.com/twentytwokhz) - florinbobis@gmail.com

Project Link: [https://github.com/twentytwokhz/quote-of-the-day](https://github.com/twentytwokhz/quote-of-the-day)
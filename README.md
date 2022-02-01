# FakeNews as a Virus
A system for collecting and analysing the source of (des)information on Twitter

To collect the relevant Twitter data prease look in the `CollectTwitterData` folder.
After the Twitter data is collected you can run the `node program`, which the following command:
```
npm start
```
This wil execute the `index.js` file which will construct the Information Strength Graph and creates a `.dot` file which can be used to conduct the analysis.
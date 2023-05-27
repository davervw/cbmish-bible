// example of accessing Bible text from JSON via JavaScript
// and making it *look* like an 8-bit famous system

const books = getBooks();

// MIT LICENSE
// bible.js Copyright 2023 by David Van Wagner dave@davevw.com
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the “Software”), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
// BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
// OR OTHER DEALINGS IN THE SOFTWARE.

function getBooks() {
  return bible.filter(x => x.chapter == "1" && x.verse == "1").map(x => x.book);
}

function findVerse(book: string, chapter: string, verse: string) {
  return bible.find(x => x.book == book && x.chapter == chapter && x.verse == verse);
}

function countBooks() {
  return books.length;
}

function countChapters(book: string) {
  return bible.filter(x => x.book == book && x.verse == "1").length;
}

function countVerses(book: string, chapter: string) {
  return bible.filter(x => x.book == book && x.chapter == chapter).length;
}

function findText(text: string, wholeWord: boolean = false, matchCase: boolean = false) {
  if (!matchCase)
    text = text.toLowerCase();
  let matches = bible.filter(x => (matchCase ? x.text : x.text.toLowerCase()).includes(text));
  if (wholeWord) {
    matches = matches.filter(x => {
      const verseWords = x.text.split(/([_\W])/).filter(x => x.match(/[a-zA-Z0-9]/) != null);
      return (verseWords.find(x => (matchCase ? x : x.toLowerCase()) == (matchCase ? text : text.toLowerCase())) != null);
    });
  }
  return matches;
}

////////////////////////////////////////////////////////////////////////

var scale = '';
var quiet: boolean = false;
var optionWord: boolean = false;
var optionCase: boolean = false;

const bibleUI = function() {
  cbm.lowercase = true;
  cbm.hideCursor();
  cbm.underline(6);
  let params = new URLSearchParams(window.location.search);
  let scaleValue = params.get('scale');
  if (scaleValue != null && scaleValue != '1')
    scale = `&scale=${scaleValue}`
  quiet = (params.get('q') != null);
  if (quiet)
    scale += "&q";
  let button = params.get('button');
  let book = params.get('book');
  let chapter = params.get('chapter');
  let verse = params.get('verse');
  let word = params.get('word');
  let page = params.get('page');
  let whole = params.get('whole');
  optionWord = (whole === 'true');
  let paramCase = params.get('case');
  optionCase = (paramCase === 'true');
  if (button == 'stats')
    bibleStats();
  else if (word != null) {
    if (book != null && chapter != null && verse != null)
      wordUI(word, findVerse(book, chapter, verse), optionWord, optionCase, (page == null) ? 1 : Number(page));
    else
      wordUI(word, null);
  } else if (book == null)
    booksUI();
  else if (chapter == null)
    bookUI(book);
  else if (verse == null)
    chapterUI(book, chapter, (page == null) ? 1 : Number(page));
  else
    verseUI(book, chapter, verse);
}

const booksUI = function() {
  history.replaceState(null, '', `?bible${scale}`);
  cbm.removeButtons();
  cbm.clear();
  cbm.underline(6);
  cbm.foreground(3);
  cbm.addLink('BIBLE', null)
    .onclick = () => setTimeout( () => { aboutBible(); }, 250);
  cbm.newLine();
  cbm.newLine();
  cbm.foreground(15);
  cbm.reverse = true;
  cbm.out('Old Testament:');
  cbm.newLine();
  const books = getBooks();
  const cols = cbm.getCols();
  let col = 0;
  books.forEach(book => {
    if (book.length + col >= cols) {
      cbm.newLine();
      col = 0;
    }
    if (book == "MATTHEW")
    {
      cbm.foreground(1);
      if (col > 0) {
        cbm.newLine();
        col = 0;
      }
      cbm.newLine();
      cbm.reverse = true;
      cbm.out('New Testament:');
      cbm.newLine();
    }
    cbm.addLink(book, null)  
      .onclick = () => setTimeout( () => { bookUI(book); }, 250);
    col += book.length;
    if (col < cols) {
      cbm.out(' ');
      ++col;
    }
    if (col == cols)
      col = 0;
  });
  addNavigationHelp("[Click BIBLE, or book to navigate]", () => booksUI());
}

const bookUI = function(book: string) {
  history.replaceState(null, '', `?book=${book}${scale}`);
  cbm.removeButtons();
  cbm.clear();
  cbm.addLink(book, null)
    .onclick = () => setTimeout( () => { booksUI(); }, 250);
  cbm.newLine();
  cbm.newLine();
  cbm.out("CHAPTERS");
  cbm.newLine();
  const cols = cbm.getCols();
  let col = 0;
  let numChapters = countChapters(book);
  for (let i=1; i<=numChapters; ++i) {
    const chapter = i.toString();
    if (chapter.length + col >= cols) {
      cbm.newLine();
      col = 0;
    }
    cbm.addLink(chapter, null)
      .onclick = () => setTimeout( () => { chapterUI(book, chapter); }, 250);
    col += chapter.length;
    if (col < cols) {
      cbm.out(' ');
      ++col;
    }
    if (col == cols)
      col = 0;
  }
  addNavigationHelp("[Click book name, or #s to navigate]", () => bookUI(book));

  cbm.lowercase = false;
  cbm.locate(35, 0);
  cbm.reverse = true;
  cbm.addLink(cbm.chr$(0xA9)+cbm.chr$(0x7F), null)
    .onclick = () => setTimeout(() => bookUI(prevBook(book)), 250);
  cbm.reverse = false;

  cbm.out(' ');

  cbm.addLink(cbm.chr$(0x7F)+cbm.chr$(0xA9), null)
    .onclick = () => setTimeout(() => bookUI(nextBook(book)), 250);

  cbm.lowercase = true;
}

const chapterUI = function(book: string, chapter: string, page = 1) {
  cbm.removeButtons();
  cbm.clear();
  cbm.lowercase = true;
  cbm.addLink(book, null)
    .onclick = () => setTimeout( () => { booksUI(); }, 250);
  cbm.out(' ');
  cbm.addLink(chapter, null)
    .onclick = () => setTimeout( () => { bookUI(book); }, 250);
  cbm.newLine();
  cbm.newLine();
  cbm.out("VERSES");
  cbm.newLine();
  const cols = cbm.getCols();
  const rows = cbm.getRows();
  let col = 0;
  let row = 3;
  let numVerses = countVerses(book, chapter);
  for (let i=1; i<=numVerses; ++i) {
    const verse = i.toString();
    if (verse.length + col >= cols) {
      cbm.newLine();
      ++row;
      col = 0;
    }
    cbm.addLink(verse, null)
      .onclick = () => setTimeout( () => {
        const entry = verseUI(book, chapter, verse);
        history.pushState(entry, '', `?book=${book}&chapter=${chapter}&verse=${verse}${scale}`);
      }, 250);
    col += verse.length;
    if (col < cols) {
      cbm.out(' ');
      ++col;
    }
    if (col == cols) {
      col = 0;
      ++row;
    }
  }

  let text = "";
  bible.filter(x => x.book == book && x.chapter == chapter)
    .forEach(x => {
      text += x.verse + " " + x.text.replace(/[\[\]]/g, '') + " ";
    });
  col = 0;
  let line = "";
  let lines = [];
  text.split(' ').forEach(word => {
    if (word == '#' || col + word.length > cols) {
      const i = line.substring(0, line.length-1).lastIndexOf(' ');
      let lastWord = line.substring(i+1);
      if (lastWord.length > 0 && !(lastWord.charAt(0) >= '1' && lastWord.charAt(0) <= '9'))
        lastWord = "";
      else {
        line = line.substring(0, i);
        lastWord += ' ';
      }
      if (line.length > 0)
        lines.push(line);
      col = lastWord.length;
      line = lastWord;
      if (word == '#') {
        line = '  ' + line;
        col += 2;
        word = '';
      }
    }
    if (word.length > 0) {
      line += word;
      col += word.length;
      if (col < cols) {
        ++col;
        line += ' ';
      }
    }
  });
  if (line.length > 0)
    lines.push(line);

  cbm.newLine();
  cbm.newLine();
  row += 2;

  const overheadRowsPage1 = row+1;
  const overheadRowsPage2 = 3;
  let totalPages = 1;
  if (overheadRowsPage1 + lines.length >= rows) {
    let linesRemaining = (lines.length - (rows - overheadRowsPage1));
    totalPages += Math.floor( (linesRemaining + (rows - overheadRowsPage2 - 1)) / (rows - overheadRowsPage2));
  }

  page = Math.floor(page);
  if (page < 1)
    page = 1;
  if (page > totalPages)
    page = totalPages;

  history.replaceState(null, '', `?book=${book}&chapter=${chapter}&page=${page}${scale}`);

  const perPage1 = rows - overheadRowsPage1;
  const perPage2 = rows - overheadRowsPage2;
  const startIndex = (page == 1) ? 0 : perPage1 + (page-2)*perPage2;
  const limitIndex = (page == 1) ? perPage1 : startIndex + perPage2;

  if (page > 1) {
    cbm.removeButtons();
    cbm.clear();
    cbm.addLink(book, null)
      .onclick = () => setTimeout( () => { booksUI(); }, 250);
    cbm.out(' ');
    cbm.addLink(chapter, null)
      .onclick = () => setTimeout( () => { bookUI(book); }, 250);
    cbm.newLine();
    cbm.newLine();
  }

  let verse = "0";
  col = 0;
  for (let i=startIndex; i < lines.length && i < limitIndex; ++i) {
    lines[i].split(' ').forEach((word: string) => {
      if (word.length > 0 && word[0] >= '1' && word[0] <= '9') {
        verse = word;
        cbm.foreground(3);
        cbm.addLink(word, null)
          .onclick = () => setTimeout(() => verseUI(book, chapter, word), 250);
      } else if (word.length > 0) {        
        cbm.foreground(1);
        cbm.addLink(word, null)
          .onclick = () => setTimeout(() => {
            optionWord = false;
            optionCase = false;
            wordUI(word, findVerse(book, chapter, verse));
          }, 250);
      }
      col += word.length;
      if (col < cols) {
        cbm.out(' ');
        ++col;
      }
    });
    if (col < cols)
      cbm.newLine();
    col = 0;
    ++row;
  }

  cbm.lowercase = false;
  cbm.locate(35, 0);
  cbm.reverse = true;
  cbm.addLink(cbm.chr$(0xA9)+cbm.chr$(0x7F), null)
    .onclick = () => setTimeout(() => {
      if (page > 1)
        chapterUI(book, chapter, page-1);
      else if (Number(chapter) > 1) {
        chapter = (Number(chapter)-1).toString();
        chapterUI(book, chapter, Number.MAX_SAFE_INTEGER);
      } else {
        book = prevBook(book);
        chapterUI(book, countChapters(book).toString(), Number.MAX_SAFE_INTEGER);
      }
    }, 250);
  cbm.reverse = false;

  cbm.out(' ');

  const totalChapters = countChapters(book);
  cbm.addLink(cbm.chr$(0x7F)+cbm.chr$(0xA9), null)
    .onclick = () => setTimeout(() => {
      if (page < totalPages)
        chapterUI(book, chapter, page+1);
      else if (Number(chapter) < totalChapters)
        chapterUI(book, (Number(chapter)+1).toString(), 1)
      else
        chapterUI(nextBook(book), "1", 1);
    }, 250);

  addNavigationHelp("[Click book name, or #s to navigate]", () => chapterUI(book, chapter));
}

const verseUI = function(book: string, chapter: string, verse: string): any {
  cbm.lowercase = true;
  cbm.foreground(1);
  cbm.removeButtons();
  cbm.clear();
  const entry = findVerse(book, chapter, verse);
  if (entry == null)
    return entry;
  history.replaceState(entry, '', `?book=${book}&chapter=${chapter}&verse=${verse}${scale}`);

  cbm.addLink(entry.book, null)
    .onclick = () => setTimeout( () => {booksUI()}, 250);

  cbm.out(' ');
  cbm.addLink(entry.chapter, null)
    .onclick = () => setTimeout( () => {bookUI(entry.book);}, 250);

  cbm.out(':');
  cbm.addLink(entry.verse, null)
    .onclick = () => setTimeout( () => {chapterUI(entry.book, entry.chapter);}, 250);

  cbm.lowercase = false;
  cbm.locate(35, 0);
  cbm.reverse = true;
  cbm.addLink(cbm.chr$(0xA9)+cbm.chr$(0x7F), null)
    .onclick = () => setTimeout( () => { versePreviousUI(book, chapter, verse); }, 250);
  cbm.reverse = false;
  cbm.out(' ');
  cbm.addLink(cbm.chr$(0x7F)+cbm.chr$(0xA9), null)
    .onclick = () => setTimeout( () => { verseNextUI(book, chapter, verse); }, 250);
  cbm.lowercase = true;

  cbm.newLine();
  const cols = cbm.getCols();
  let col = 0;
  const text = entry.text.replace(/[\[\]#]/g, '')
  text.split(' ').forEach(word => {
    if (word.length > 0) {
      if (word.length + col >= cols) {
        cbm.newLine();
        col = 0;
      }
      cbm.addLink(word, null)
        .onclick = () => setTimeout(() => wordUI(word, entry), 250);
      col += word.length;
      if (col < cols) {
        cbm.out(' ');
        ++col;
      }
      if (col == cols)
        col = 0;
    }
  });
  addNavigationHelp("[Click book name, <>, #s to navigate]", () => verseUI(book, chapter, verse));
  return entry;
}

const versePreviousUI = function(book: string, chapter: string, verse: string) {
  chapter = (verse == '1') ? (Number(chapter)-1).toString() : chapter;
  if (chapter == '0') {
    book = prevBook(book);
    chapter = countChapters(book).toString();
  }
  verse = (verse == '1') ? countVerses(book, chapter).toString() : (Number(verse)-1).toString();
  verseUI(book, chapter, verse);
}

const verseNextUI = function(book: string, chapter: string, verse: string) {
  let next = verseUI(book, chapter, (Number(verse)+1).toString());
  if (next == null)
    next = verseUI(book, (Number(chapter)+1).toString(), '1');
  if (next == null) {
    book = nextBook(book);
    verseUI(book, '1', '1');
  }
}

const prevBook = function(book: string): string {
  const books = getBooks();
  const i = books.findIndex(x => x == book);
  if (i == 0)
    return books[books.length-1];
  return books[i-1];
}

const nextBook = function(book: string): string {
  const books = getBooks();
  const i = books.findIndex(x => x == book);
  if (i == books.length-1)
    return books[0];
  return books[i+1];
}

const aboutBible = function() {
  history.replaceState(null, '', `?button=BIBLE${scale}`);
  cbm.removeButtons();
  cbm.clear();
  cbm.lowercase = true;
  cbm.underline(15);
  cbm.newLine();
  cbm.foreground(1);
  cbm.out("About");
  cbm.newLine();
  cbm.newLine();
  cbm.out("BIBLE");
  cbm.out(" is built on ");
  cbm.out("cbmish-script");
  cbm.out(" which   provides a retro Commodore-like look    and feel for the web programmed in and  with TypeScript.");
  cbm.newLine();
  cbm.newLine();
  cbm.foreground(15);
  cbm.out('Open Source (MIT LICENSE)');
  cbm.newLine();
  cbm.out('Copyright (c) 2023 by David Van Wagner');
  cbm.newLine();
  cbm.foreground(3);
  cbm.out("BIBLE ");
  cbm.foreground(15);
  cbm.addLink("github.com/davervw/cbmish-bible", "https://github.com/davervw/cbmish-bible");
  cbm.newLine();
  cbm.foreground(3);
  cbm.out("cbm-ish ");
  cbm.foreground(15);
  cbm.addLink("github.com/davervw/cbmish-script", "https://github.com/davervw/cbmish-script");
  cbm.newLine();
  cbm.newLine();
  let row = 0;
  let col = 0;
  [row, col] = cbm.locate(0,0);
  cbm.locate(col, row);
  cbm.foreground(1);
  const button1 = cbm.addButton("Back");
  button1.onclick = () => setTimeout( () => {
    history.replaceState(null, '', `?bible${scale}`);
    bibleUI();
  }, 250);
  cbm.locate(col+7, row);
  const button2 = cbm.addButton("Bible stats")
  button2.onclick = () => setTimeout( () => {
    bibleStats();
  }, 250);
  cbm.locate(col+21, row);
  const button3 = cbm.addButton("CBM Samples");
  button3.onclick = () => setTimeout( () => {
    history.replaceState(null, '', `?bible${scale}`);
    mainMenu();
  }, 250);
}

const addNavigationHelp = function(message: string, homefn:() => void)
{
  cbm.locate(0, cbm.getRows()-1);
  cbm.foreground(15);
  cbm.reverse = true;
  if (quiet) {
    cbm.addLink('?', null)
      .onclick = () => setTimeout( () => {
        if (quiet) {
          quiet = false;
          scale = scale.substring(0, scale.length-2);
          homefn();
        }
      }, 250);
  } else {
    cbm.addLink('-', null)
      .onclick = () => setTimeout( () => {
        if (!quiet) {
          quiet = true;
          scale += '&q';
          homefn();
        }
      }, 250);
      cbm.out(message);
    }
  cbm.reverse = false;
  cbm.foreground(1);
}

const bibleStats = function() {
  cbm.lowercase = true;
  cbm.removeButtons();
  cbm.clear();
  history.replaceState(null, '', `?button=stats${scale}`);
  const numBooks = countBooks();
  const numVerses = bible.length;
  let numChapters = 0;
  let maxChaptersCount = 0;
  let maxChaptersBook = null;
  books.forEach(book => {
    const bookChapters = countChapters(book);
    numChapters += bookChapters;
    if (bookChapters > maxChaptersCount) {
      maxChaptersCount = bookChapters;
      maxChaptersBook = book;
    }
  });
  let maxVerse = bible[0];
  let countBytes = 0;
  let countWords = 0;
  let words = new Set();
  let punctuation = new Set();
  bible.forEach(x => {
    if (Number(x.verse) > Number(maxVerse.verse)) {
      maxVerse = x;
    }
    countBytes += (x.text.length + 1); // add newline
    const verseWords = x.text.split(/[ \.,;:?()\[\]']/)
      .filter(x => x.match(/[a-zA-Z]/) != null);
    verseWords.forEach(word => {
      if (word != 's' && word != 'S') {
        words.add(word.toLowerCase())
        ++countWords;
      }
    });
    for (let i=0; i<x.text.length; ++i) {
      const ch = x.text.charAt(i);
      if (ch == '-' || ch >= 'a' && ch <= 'z' || ch >= 'A' && ch <= 'Z' || ch == ' ')
        continue; // words
      if (ch == '[' || ch == ']' || ch == '#')
        continue; // editor's marks and paragraph
      punctuation.add(ch);
    }
  });

  let longestWord = '';
  words.forEach((word: string) => {
    if (word.length > longestWord.length)
      longestWord = word;
  });

  cbm.underline(6);
  cbm.addLink('BIBLE KJV', 'https://en.wikipedia.org/wiki/King_James_Version');
  cbm.newLine();
  cbm.newLine();
  cbm.addLink(`${numBooks} books`, null)
    .onclick = () => setTimeout(() => booksUI(), 250);
  cbm.newLine();
  cbm.out(`${numChapters} total chapters\r`);
  cbm.out(`${numVerses} total verses\r`);
  cbm.out(`${countBytes} total bytes of text\r`);
  cbm.out(`${countWords} total words\r`)
  cbm.out(`${words.size} distinct words\r`)
  cbm.newLine();
  cbm.addLink(`${maxChaptersBook} has ${maxChaptersCount} chapters`, null)
    .onclick = () => setTimeout(() => bookUI(maxChaptersBook), 250);
  cbm.newLine();
  cbm.addLink(`${maxVerse.book} ${maxVerse.chapter} has ${maxVerse.verse} verses`, null)
    .onclick = () => setTimeout(() => chapterUI(maxVerse.book, maxVerse.chapter), 250);
  cbm.newLine();

  let longestVerse = null;
  bible.forEach(x => {
    if (longestVerse == null || x.text.length > longestVerse.text.length)
      longestVerse = x;
  });
  cbm.addLink(`longest verse: ${longestVerse.book} ${longestVerse.chapter}:${longestVerse.verse}`, null)
    .onclick = () => setTimeout(() => {
      verseUI(longestVerse.book, longestVerse.chapter, longestVerse.verse);
    }, 250);
  cbm.newLine();

  const unicorns = findText('unicorn');
  cbm.addLink(`unicorn: ${unicorns.length}`, null)
    .onclick = () => setTimeout(() => wordUI('unicorn', null), 250);
  cbm.newLine();

  cbm.addLink(`longest word is ${longestWord}`, null)
    .onclick = () => setTimeout(() => wordUI(longestWord, null), 250);
  cbm.newLine();

  const dragons = findText('dragon');
  cbm.addLink(`dragon: ${dragons.length}`, null)
    .onclick = () => setTimeout(() => wordUI('dragon', null), 250);
  cbm.newLine();

  const satans = findText('satan');
  cbm.addLink(`satan: ${satans.length}`, null)
    .onclick = () => setTimeout(() => wordUI('satan', null), 250);
  cbm.newLine();

  const loves = findText('love');
  cbm.addLink(`love: ${loves.length}`, null)
    .onclick = () => setTimeout(() => wordUI('love', null), 250);
  cbm.newLine();

  const sufferings = findText('suffering');
  cbm.addLink(`suffering: ${sufferings.length}`, null)
    .onclick = () => setTimeout(() => wordUI('suffering', null), 250);
  cbm.newLine();

  const jesus = findText('Jesus', true, true);
  cbm.addLink(`Jesus: ${jesus.length}`, null)
    .onclick = () => setTimeout(() => wordUI('Jesus', null), 250);
  cbm.newLine();

  const abrahams = findText('Abraham', true, true);
  cbm.addLink(`Abraham: ${abrahams.length}`, null)
    .onclick = () => setTimeout(() => wordUI('Abraham', null, true), 250);
  cbm.newLine();

  const God = findText('God', true, true);
  cbm.addLink(`God [word, case]: ${God.length}`, null)
    .onclick = () => setTimeout(() => wordUI('God', null, true, true), 250);
  cbm.newLine();

  const god = findText('god');
  cbm.addLink(`god: ${god.length}`, null)
    .onclick = () => setTimeout(() => wordUI('god', null), 250);
  cbm.newLine();

  cbm.out('punctuation:');
  punctuation.forEach((ch: string) => cbm.out(ch));
  cbm.newLine();

  cbm.locate(cbm.getCols()-7, cbm.getRows()-3);
  const back = cbm.addButton("Back");
  back.onclick = () => setTimeout(() => aboutBible(), 250);
}

const wordUI = function(word: string, entry: any, setOptionWord: boolean = false, setOptionCase: boolean = false, page = 1) {
  cbm.lowercase = true;
  cbm.removeButtons();
  cbm.foreground(1);
  cbm.clear();

  optionWord = setOptionWord;
  optionCase = setOptionCase;

  let i = word.indexOf("'");
  if (i >= 0)
    word = word.substring(0, i); // remove 's or similar
  while (word.length > 0) {
    const last = word.charAt(word.length-1);
    if (last >= 'a' && last <= 'z' || last >= 'A' && last <= 'Z')
      break;
    word = word.substring(0, word.length-1); // remove punctuation
  }

  buildWholeWordControl(word, page, entry);
  cbm.out(' ');
  buildMatchCaseControl(word, page, entry);

  const results = findText(word, optionWord, optionCase);
  const perPage = cbm.getRows()-2;
  const totalPages = Math.floor((results.length + perPage - 1) / perPage);

  cbm.out(` ${results.length} matches`);
  cbm.newLine();
  cbm.out('Search: ');
  cbm.underline(3);
  cbm.underlined = true;
  cbm.out(word.padEnd(cbm.getCols()-9));
  cbm.underline(6);

  page = Math.floor(page);
  if (page < 1)
    page = 1;
  if (page > totalPages)
    page = totalPages;

  if (entry == null)
    history.replaceState(null, '', `?word=${word}&page=${page}${scale}`);
  else
    history.replaceState(null, '', `?word=${word}&page=${page}&book=${entry.book}&chapter=${entry.chapter}&verse=${entry.verse}&whole=${optionWord}&case=${optionCase}${scale}`);

  let saveRow = 0;
  let saveCol = 0;
  [saveRow, saveCol] = cbm.locate(0, 0);
  cbm.locate(33, saveRow);  

  cbm.lowercase = false;
  cbm.up();
  cbm.addLink(cbm.chr$(95), null)
    .onclick = () => setTimeout(() => {
      if (entry != null)
        verseUI(entry.book, entry.chapter, entry.verse);
      else
        bibleUI();
    }, 250);

  cbm.out(' ');

  if (page > 1) {
    cbm.reverse = true;
    cbm.addLink(cbm.chr$(0xA9)+cbm.chr$(0x7F), null)
      .onclick = () => setTimeout(() => wordUI(word, entry, false, false, page-1), 250);
    cbm.reverse = false;
  }
  else
    cbm.out('  ');

  cbm.out(' ');

  if (page < totalPages) {
    cbm.addLink(cbm.chr$(0x7F)+cbm.chr$(0xA9), null)
      .onclick = () => setTimeout(() => wordUI(word, entry, false, false, page+1), 250);
  }

  cbm.locate(0, 2);
  cbm.lowercase = true;

  const cols = cbm.getCols();

  for (i=(page-1)*perPage; i<results.length && i<page*perPage; ++i) {
    const entry = results[i];
    let text = entry.text.replace('# ', '');
    text = text.replace(/[\[\]#]/g, '')
    let line = `${entry.book} ${entry.chapter}:${entry.verse} ${text}`;
    if (line.length >= cols)
      line = line.substring(0, cols-4) + "...";
    cbm.addLink(line, null)
      .onclick = () => setTimeout(() => verseUI(entry.book, entry.chapter, entry.verse), 250);
    if (line.length < cols && i<page*perPage-1)
      cbm.newLine();
  }
}

const buildWholeWordControl = function(word: string, page: number, entry: any) {
  let label = `[${optionWord?'X':' '}] word`;
  const link = cbm.addLink(label, null);
  link.onclick = () => setTimeout(() => { 
      optionWord = !optionWord;
      wordUI(word, entry, optionWord, optionCase, page);
    }, 250);
}

const buildMatchCaseControl = function(word: string, page: number, entry: any) {
  let label = `[${optionCase?'X':' '}] case`;
  const link = cbm.addLink(label, null);
  link.onclick = () => setTimeout(() => { 
      optionCase = !optionCase;
      wordUI(word, entry, optionWord, optionCase, page);
    }, 250);
}

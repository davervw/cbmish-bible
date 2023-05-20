// example of accessing Bible text from JSON via JavaScript
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
function findVerse(book, chapter, verse) {
    return bible.find(x => x.book == book && x.chapter == chapter && x.verse == verse);
}
function countBooks() {
    return books.length;
}
function countChapters(book) {
    return bible.filter(x => x.book == book && x.verse == "1").length;
}
function countVerses(book, chapter) {
    return bible.filter(x => x.book == book && x.chapter == chapter).length;
}
function findText(text) {
    text = text.toLowerCase();
    return bible.filter(x => x.text.toLowerCase().includes(text));
}
////////////////////////////////////////////////////////////////////////
var scale = '';
var quiet = false;
const bibleUI = function () {
    cbm.hideCursor();
    cbm.underline(6);
    let params = new URLSearchParams(window.location.search);
    let scaleValue = params.get('scale');
    if (scaleValue != null && scaleValue != '1')
        scale = `&scale=${scaleValue}`;
    quiet = (params.get('q') != null);
    if (quiet)
        scale += "&q";
    let book = params.get('book');
    let chapter = params.get('chapter');
    let verse = params.get('verse');
    if (book == null)
        booksUI();
    else if (chapter == null)
        bookUI(book);
    else if (verse == null)
        chapterUI(book, chapter);
    else
        verseUI(book, chapter, verse);
};
const booksUI = function () {
    history.replaceState(null, '', `?bible${scale}`);
    cbm.removeButtons();
    cbm.clear();
    cbm.underline(6);
    cbm.foreground(3);
    const about = cbm.addLink('BIBLE', null);
    about.onclick = () => setTimeout(() => { aboutBible(); }, 250);
    cbm.newLine();
    cbm.newLine();
    cbm.foreground(15);
    cbm.out('OLD TESTAMENT:');
    cbm.newLine();
    const books = getBooks();
    const cols = cbm.getWidth() / 8;
    let col = 0;
    books.forEach(book => {
        if (book.length + col >= cols) {
            cbm.newLine();
            col = 0;
        }
        if (book == "MATTHEW") {
            cbm.foreground(1);
            if (col > 0) {
                cbm.newLine();
                col = 0;
            }
            cbm.newLine();
            cbm.out('NEW TESTAMENT:');
            cbm.newLine();
        }
        const link = cbm.addLink(book, null);
        link.onclick = () => setTimeout(() => { bookUI(book); }, 250);
        col += book.length;
        if (col < cols) {
            cbm.out(' ');
            ++col;
        }
        if (col == cols)
            col = 0;
    });
    addNavigationHelp("[Click BIBLE, or book to navigate]", () => booksUI());
};
const bookUI = function (book) {
    history.replaceState(null, '', `?book=${book}${scale}`);
    cbm.removeButtons();
    cbm.clear();
    const back = cbm.addLink(book, null);
    back.onclick = () => setTimeout(() => { booksUI(); }, 250);
    cbm.newLine();
    cbm.newLine();
    cbm.out("CHAPTERS");
    cbm.newLine();
    const cols = cbm.getWidth() / 8;
    let col = 0;
    let numChapters = countChapters(book);
    for (let i = 1; i <= numChapters; ++i) {
        const chapter = i.toString();
        if (chapter.length + col >= cols) {
            cbm.newLine();
            col = 0;
        }
        const link = cbm.addLink(chapter, null);
        link.onclick = () => setTimeout(() => { chapterUI(book, chapter); }, 250);
        col += chapter.length;
        if (col < cols) {
            cbm.out(' ');
            ++col;
        }
        if (col == cols)
            col = 0;
    }
    addNavigationHelp("[Click book name, or #s to navigate]", () => bookUI(book));
};
const chapterUI = function (book, chapter) {
    history.replaceState(null, '', `?book=${book}&chapter=${chapter}${scale}`);
    cbm.removeButtons();
    cbm.clear();
    const goBooks = cbm.addLink(book, null);
    goBooks.onclick = () => setTimeout(() => { booksUI(); }, 250);
    cbm.out(' ');
    const goChapters = cbm.addLink(chapter, null);
    goChapters.onclick = () => setTimeout(() => { bookUI(book); }, 250);
    cbm.newLine();
    cbm.newLine();
    cbm.out("VERSES");
    cbm.newLine();
    const cols = cbm.getWidth() / 8;
    let col = 0;
    let numVerses = countVerses(book, chapter);
    for (let i = 1; i <= numVerses; ++i) {
        const verse = i.toString();
        if (verse.length + col >= cols) {
            cbm.newLine();
            col = 0;
        }
        const link = cbm.addLink(verse, null);
        link.onclick = () => setTimeout(() => {
            const entry = verseUI(book, chapter, verse);
            history.pushState(entry, '', `?book=${book}&chapter=${chapter}&verse=${verse}${scale}`);
        }, 250);
        col += verse.length;
        if (col < cols) {
            cbm.out(' ');
            ++col;
        }
        if (col == cols)
            col = 0;
    }
    addNavigationHelp("[Click book name, or #s to navigate]", () => chapterUI(book, chapter));
};
const verseUI = function (book, chapter, verse) {
    cbm.foreground(1);
    cbm.removeButtons();
    cbm.clear();
    const entry = findVerse(book, chapter, verse);
    if (entry == null)
        return entry;
    history.replaceState(entry, '', `?book=${book}&chapter=${chapter}&verse=${verse}${scale}`);
    {
        const link = cbm.addLink('<', null);
        link.onclick = () => setTimeout(() => { versePreviousUI(book, chapter, verse); }, 250);
    }
    cbm.out(' ');
    {
        const link = cbm.addLink('>', null);
        link.onclick = () => setTimeout(() => { verseNextUI(book, chapter, verse); }, 250);
    }
    cbm.out(' ');
    {
        const link = cbm.addLink(entry.book, null);
        link.onclick = () => setTimeout(() => {
            booksUI();
        }, 250);
    }
    cbm.out(' ');
    {
        const link = cbm.addLink(entry.chapter, null);
        link.onclick = () => setTimeout(() => {
            bookUI(entry.book);
        }, 250);
    }
    cbm.out(':');
    {
        const link = cbm.addLink(entry.verse, null);
        link.onclick = () => setTimeout(() => {
            chapterUI(entry.book, entry.chapter);
        }, 250);
    }
    cbm.newLine();
    cbm.newLine();
    const cols = cbm.getWidth() / 8;
    let col = 0;
    const text = entry.text.replace(/[\[\]#]/g, '');
    text.split(' ').forEach(word => {
        if (word.length > 0) {
            if (word.length + col >= cols) {
                cbm.newLine();
                col = 0;
            }
            cbm.out(word);
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
};
const versePreviousUI = function (book, chapter, verse) {
    chapter = (verse == '1') ? (Number(chapter) - 1).toString() : chapter;
    if (chapter == '0') {
        book = prevBook(book);
        chapter = countChapters(book).toString();
    }
    verse = (verse == '1') ? countVerses(book, chapter).toString() : (Number(verse) - 1).toString();
    verseUI(book, chapter, verse);
};
const verseNextUI = function (book, chapter, verse) {
    let next = verseUI(book, chapter, (Number(verse) + 1).toString());
    if (next == null)
        next = verseUI(book, (Number(chapter) + 1).toString(), '1');
    if (next == null) {
        book = nextBook(book);
        verseUI(book, '1', '1');
    }
};
const prevBook = function (book) {
    const books = getBooks();
    const i = books.findIndex(x => x == book);
    if (i == 0)
        return books[books.length - 1];
    return books[i - 1];
};
const nextBook = function (book) {
    const books = getBooks();
    const i = books.findIndex(x => x == book);
    if (i == books.length - 1)
        return books[0];
    return books[i + 1];
};
const aboutBible = function () {
    history.replaceState(null, '', `?button=BIBLE${scale}`);
    cbm.removeButtons();
    cbm.clear();
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
    const link1 = cbm.addLink("github.com/davervw/cbmish-bible", "https://github.com/davervw/cbmish-bible");
    cbm.newLine();
    cbm.foreground(3);
    cbm.out("cbm-ish ");
    cbm.foreground(15);
    const link2 = cbm.addLink("github.com/davervw/cbmish-script", "https://github.com/davervw/cbmish-script");
    cbm.newLine();
    cbm.newLine();
    let row = 0;
    let col = 0;
    [row, col] = cbm.locate(0, 0);
    cbm.locate(col, row);
    cbm.foreground(1);
    const button1 = cbm.addButton("Back");
    button1.onclick = () => setTimeout(() => {
        history.replaceState(null, '', `?bible${scale}`);
        bibleUI();
    }, 250);
    cbm.locate(col + 7, row);
    const button2 = cbm.addButton("CBM Samples");
    button2.onclick = () => setTimeout(() => {
        history.replaceState(null, '', `?bible${scale}`);
        mainMenu();
    }, 250);
};
const addNavigationHelp = function (message, homefn) {
    cbm.locate(0, cbm.getHeight() / 8 - 1);
    cbm.foreground(15);
    cbm.reverse = true;
    if (quiet) {
        const help = cbm.addLink('?', null);
        help.onclick = () => setTimeout(() => {
            if (quiet) {
                quiet = false;
                scale = scale.substring(0, scale.length - 2);
                homefn();
            }
        }, 250);
    }
    else {
        const unhelp = cbm.addLink('-', null);
        unhelp.onclick = () => setTimeout(() => {
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
};
//# sourceMappingURL=bible-access.js.map
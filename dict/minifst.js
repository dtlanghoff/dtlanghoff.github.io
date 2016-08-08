/*
  The MIT License (MIT)
  Copyright (c) 2016 Daniel Tobias Johansen Langhoff
  
  See license-mit.txt
*/

var minifst_analyser = {};
var minifst_generator = {};

function minifst_init(language) {
    $.getJSON(language + '-anafst.json', function(json) {
        minifst_analyser[language] = json;
    });
    $.getJSON(language + '-genfst.json', function(json) {
        minifst_generator[language] = json;
    });
}

function * minifst_lookup(transducer, word, state = 0, acc = '') {
    if (state == -1) {
        if (word == '')
            yield acc;
        return;
    }

    for (var key in transducer[state]) {
        if (word.startsWith(key)) {
            for (var i of transducer[state][key]) {
                for (var j of minifst_lookup(transducer, word.slice(key.length), i[0], acc + i[1])) {
                    yield j;
                }
            }
        }
        else if (key == '@end@') {
            for (var j of minifst_lookup(transducer, word, -1, acc)) {
                yield j;
            }
        }
    }
}

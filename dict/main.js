/*
  The MIT License (MIT)
  Copyright (c) 2016 Daniel Tobias Johansen Langhoff
  
  See license-mit.txt
*/

minifst_init('fkv');

var dict_fkvnob;
var dict_nobfkv;

$.getJSON('fkvnob.json', function(json) {
    dict_fkvnob = json;
});
$.getJSON('nobfkv.json', function(json) {
    dict_nobfkv = json;
});

var noun_cases = ['Nom', 'Gen', 'Par', 'Ine', 'Ill', 'Ela', 'Ade', 'Abl', 'All', 'Ess', 'Tra', 'Abe', 'Com'];

function build_declension(word, type = 'N') {
    var html = '';

    if (type == 'A')
        var t = 'a';
    else
        var t = 'n';
    
    html += '<table><tr><td>[' + word + ' <i>' + t + '</i>]</td><th>Sg</th><th>Pl</th>';
    for (var _case of noun_cases) {
        html += '<tr><th>' + _case + '</th>';
        for (var number of ['Sg', 'Pl'])
            html += '<td>' + Array.from(minifst_lookup(minifst_generator['fkv'], word + '+' + type + '+' + number + '+' + _case)).join('<br/>') + '</td>'
        html += '</tr>'
    }
    html += '</table>';

    return html;
}

function main() {
    if (!document.getElementById('lock').checked) {
        var search = document.getElementById('search').value;
        var cache = [];
        var words_to_decline = new Set();
        
        for (var query of search.split(';')) {
            var cache_entry = {'raw': [], 'html': []}
            query = query.trim();

            var generator_mode = query.indexOf('+') != -1;
            if (generator_mode)
                var transducer = minifst_generator['fkv'];
            else
                var transducer = minifst_analyser['fkv'];
            
            var words_to_translate = new Set();

            if (generator_mode) {
                var spl = query.split('+');
                if (spl[1] == 'N') {
                    if (spl[2] == 'Prop')
                        words_to_decline.add(spl[0] + '+N+Prop');
                    else
                        words_to_decline.add(spl[0] + '+N');
                }
                else if (spl[1] == 'A')
                    words_to_decline.add(spl[0] + '+A');
            }

            for (var word of minifst_lookup(transducer, query)) {
                cache_entry['raw'].push(word);
                if (!generator_mode) {
                    for (stem of word.split('#')) {
                        var spl = stem.split('+')
                        words_to_translate.add(spl[0]);
                        if (spl[1] == 'N') {
                            if (spl[2] == 'Prop')
                                words_to_decline.add(spl[0] + '+N+Prop');
                            else
                                words_to_decline.add(spl[0] + '+N');
                        }
                        else if (spl[1] == 'A')
                            words_to_decline.add(spl[0] + '+A');
                    }
                }
            }
                
            words_to_translate.add(query.split('+')[0]);

            if (!generator_mode && query in dict_nobfkv) {
                var a = [];
                for (var i of dict_nobfkv[query]) {
                    a.push(i.join(', '));
                }
                cache_entry['html'].push('(no) <b>' + query + '</b> ' + a.join('; '));
            }

            var a = [];
            for (var word of Array.from(words_to_translate).sort()) {
                if (word in dict_fkvnob) {
                    var b = [];
                    for (var translation of dict_fkvnob[word]) {
                        b.push(translation.join(', '));
                    }
                    a.push('<b>' + word + '</b> ' + b.join('; '));
                }
            }

            cache_entry['html'].push(a.join('<br/>') + '<hr/>');
            cache.push(cache_entry);
        }

        var html = '';
        
        for (var entry of cache) {
            html += '<pre>' + entry['raw'].join('\n') + '</pre>';
            html += '<p>' + entry['html'].join('</p><p>') + '</p>';
        }

        if (document.getElementById('declension').checked) {
            for (var word of Array.from(words_to_decline).sort()) {
                var spl = word.split('+');
                html += build_declension(spl[0], spl.splice(1).join('+'));
            }
        }
        
        document.getElementById('ansresult').innerHTML = html;
    }
}

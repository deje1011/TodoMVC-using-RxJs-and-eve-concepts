window.eve = (function () {

    'use strict';

    const records = new Rx.BehaviorSubject([]);

    return {
        commit: (record) => {
            const id = parseInt(_.uniqueId());
            records.next(records.getValue().concat(_.extend({}, record, {id})));
            return id;
        },
        commitChange: (query, mapFn) => {
            records.next(_.map(records.getValue(), record => {
                if (_.isMatch(record, query)) {
                    return mapFn(_.cloneDeep(record));
                }
                return record;
            }));
        },
        remove: (query) => {
            records.next(_.filter(records.getValue(), record => _.isMatch(record, query) === false));
        },
        search: (query) => {
            if (!query) {
                return records;
            }
            return records.map(records => _.filter(records, record => _.isMatch(record, query)));
        },
        bindBrowser: (params) => {
            const ractive = new Ractive({
                template: params.template,
                el: params.element,
                data: {}
            });
            return params.search.subscribe(results => {
                ractive.set(params.resultsAs || 'results', results);
            });

        }
    }

}());
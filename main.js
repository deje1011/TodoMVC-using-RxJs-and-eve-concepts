(function () {

    'use strict';

    /*
        Example records

        {id: 1, tag: 'todo', text: 'Buy Milk', complete: true},
        {id: 2, tag: 'todo', text: 'Clean up', complete: false},
        {id: 3, tag: 'filter', query: {complete: true}}

        ==> This would display only 1 todo ('Buy Milk')
    */


    /*
        Render a todo list
    */

    eve.bindBrowser({
        search: eve
            .search({tag: 'todo'})
            .combineLatest(eve.search({tag: 'filter'}), (todos, filters) => {
                return _.reduce(filters, (finalTodos, filter) => _.filter(finalTodos, filter.query), todos);
            }),
        resultsAs: 'todos',
        template: '#todo-list-item-template',
        element: '.todo-list'
    });


    /*
        Mark as complete/incomplete on click
    */

    Rx.Observable
        .fromEvent(document.querySelector('.todo-list'), 'click')
        .filter(event => event.target.classList.contains('toggle'))
        .map(event => parseInt(event.target.closest('.todo-item').getAttribute('todo-id')))
        .filter(todoId => _.isNaN(todoId) === false)
        .subscribe(todoId => {
            eve.commitChange({tag: 'todo', id: todoId}, todo => {
                todo.complete = !todo.complete;
                return todo;
            });
        });


    /*
        Create new todos
    */

    Rx.Observable
        .fromEvent(document.querySelector('.new-todo'), 'keydown')
        .filter(event => event.keyCode === 13)
        .map(event => event.target.value)
        .filter(text => _.isEmpty(text) === false)
        .subscribe(text => {
            eve.commit({tag: 'todo', text: text, complete: false});
            event.target.value = '';
        });

    /*
        Edit todos
    */

    Rx.Observable
        .fromEvent(document.querySelector('.todo-list'), 'dblclick')
        .map(event => ({event: event, delegate: event.target.closest('.todo-item-text')}))
        .filter(eventContainer => _.isNil(eventContainer.delegate) === false)
        .subscribe(eventContainer => {
            eventContainer.delegate.setAttribute("contentEditable", true);
            eventContainer.delegate.focus();
        });

    Rx.Observable
        .fromEvent(document.querySelector('.todo-list'), 'keydown')
        .filter(event => event.keyCode === 13)
        .map(event => ({event: event, delegate: event.target.closest('.todo-item-text')}))
        .filter(eventContainer => _.isNil(eventContainer.delegate) === false)
        .subscribe(eventContainer => {
            eventContainer.delegate.setAttribute("contentEditable", false);
            eve.commitChange({
                tag: 'todo',
                id: parseInt(eventContainer.delegate.closest('.todo-item').getAttribute('todo-id'))
            }, todo => {
                todo.text = eventContainer.delegate.textContent;
                return todo;
            });
        });

    /*
        Delete todos
    */

    Rx.Observable
        .fromEvent(document.querySelector('.todo-list'), 'click')
        .filter(event => event.target.classList.contains('destroy'))
        .map(event => event.target.closest('.todo-item').getAttribute('todo-id'))
        .map(Number)
        .subscribe(todoId => eve.remove({tag: 'todo', id: todoId}));



    /*
        Clear completed
    */

    Rx.Observable
        .fromEvent(document.querySelector('.clear-completed'), 'click')
        .subscribe(event => eve.remove({tag: 'todo', complete: true}));

    /*
        Toggle All
    */

    Rx.Observable
        .fromEvent(document.querySelector('.toggle-all'), 'click')
        .flatMap(event => eve.search({tag: 'todo'}).take(1))
        .map(todos => _.every(todos, {complete: true}))
        .subscribe(allAreCompleted => {
            eve.commitChange({tag: 'todo'}, todo => {
                todo.complete = !allAreCompleted;
                return todo;
            });
        });


    /*
        Apply filters
    */

    Rx.Observable
        .fromEvent(document.querySelector('.filters'), 'click')
        .map(event => event.target.closest('.filter-button'))
        .subscribe(clickedFilterButton => {

            eve.remove({tag: 'filter'});

            if (clickedFilterButton.classList.contains('show-active-button')) {
                eve.commit({tag: 'filter', query: {complete: false}});
            }
            else if (clickedFilterButton.classList.contains('show-completed-button')) {
                eve.commit({tag: 'filter', query: {complete: true}});
            }
        });


    /*
        Render filter buttons
    */

    eve.bindBrowser({
        search: eve.search({tag: 'filter'}).map(_.first),
        resultsAs: 'filter',
        template: '#filters-template',
        element: '.filters'
    });



    /*
        Todo Count
    */

    eve.bindBrowser({
        search: eve
            .search({tag: 'todo'})
            .map(todos => {
                return _.reduce(todos, (total, todo) => todo.complete ? total : total + 1, 0);
            }),
        resultsAs: 'count',
        template: '#todo-count-template',
        element: '.todo-count'
    });


    /*
        Hide parts of the ui if there are no todos
    */
    eve.search({tag: 'todo'})
        .map(todos => todos.length)
        .subscribe(numberOfTodos => {
            _(['.footer', '.toggle-all'])
                .map(selector => document.querySelector(selector))
                .each(domNode => domNode.style.display = numberOfTodos === 0 ? 'none' : '');
        });



    /*
        Session storage
    */
    _.each(JSON.parse(sessionStorage.getItem('records')), eve.commit);
    eve.search().map(JSON.stringify).subscribe(todos => sessionStorage.setItem('records', todos));

}());
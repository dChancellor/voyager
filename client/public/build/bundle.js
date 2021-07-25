
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/micro-components/LeftArrow.svelte generated by Svelte v3.38.3 */
    const file$4 = "src/components/micro-components/LeftArrow.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$4, 7, 4, 255);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "arrow svelte-16qbxwn");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			add_location(svg, file$4, 6, 2, 176);
    			attr_dev(div, "class", "button svelte-16qbxwn");
    			add_location(div, file$4, 5, 0, 114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LeftArrow", slots, []);
    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LeftArrow> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("decrement");
    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch });
    	return [dispatch, click_handler];
    }

    class LeftArrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LeftArrow",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/micro-components/RightArrow.svelte generated by Svelte v3.38.3 */
    const file$3 = "src/components/micro-components/RightArrow.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let svg;
    	let path;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill-rule", "evenodd");
    			attr_dev(path, "d", "M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z");
    			attr_dev(path, "clip-rule", "evenodd");
    			add_location(path, file$3, 7, 4, 275);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "arrow svelte-1vr9oeo");
    			attr_dev(svg, "viewBox", "0 0 20 20");
    			attr_dev(svg, "fill", "currentColor");
    			add_location(svg, file$3, 6, 2, 176);
    			attr_dev(div, "class", "button svelte-1vr9oeo");
    			add_location(div, file$3, 5, 0, 114);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, path);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RightArrow", slots, []);
    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RightArrow> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => dispatch("increment");
    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch });
    	return [dispatch, click_handler];
    }

    class RightArrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RightArrow",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/micro-components/TextField.svelte generated by Svelte v3.38.3 */
    const file$2 = "src/components/micro-components/TextField.svelte";

    function create_fragment$2(ctx) {
    	let p;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "editable field svelte-16oensu");
    			attr_dev(p, "contenteditable", "true");
    			attr_dev(p, "placeholder", /*placeholder*/ ctx[0]);
    			if (/*textContent*/ ctx[2] === void 0) add_render_callback(() => /*p_input_handler*/ ctx[8].call(p));
    			toggle_class(p, "required", /*required*/ ctx[1]);
    			toggle_class(p, "empty", /*empty*/ ctx[3]);
    			add_location(p, file$2, 11, 0, 297);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);

    			if (/*textContent*/ ctx[2] !== void 0) {
    				p.textContent = /*textContent*/ ctx[2];
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(p, "blur", /*blur_handler*/ ctx[7], false, false, false),
    					listen_dev(p, "input", /*p_input_handler*/ ctx[8])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*placeholder*/ 1) {
    				attr_dev(p, "placeholder", /*placeholder*/ ctx[0]);
    			}

    			if (dirty & /*textContent*/ 4 && /*textContent*/ ctx[2] !== p.textContent) {
    				p.textContent = /*textContent*/ ctx[2];
    			}

    			if (dirty & /*required*/ 2) {
    				toggle_class(p, "required", /*required*/ ctx[1]);
    			}

    			if (dirty & /*empty*/ 8) {
    				toggle_class(p, "empty", /*empty*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let empty;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TextField", slots, []);
    	const dispatch = createEventDispatcher();
    	let { placeholder = "www.google.com" } = $$props;
    	let { required } = $$props;
    	let { value } = $$props;
    	let { error } = $$props;
    	let textContent = value;
    	const writable_props = ["placeholder", "required", "value", "error"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TextField> was created with unknown prop '${key}'`);
    	});

    	const blur_handler = () => dispatch("save", textContent);

    	function p_input_handler() {
    		textContent = this.textContent;
    		$$invalidate(2, textContent);
    	}

    	$$self.$$set = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("error" in $$props) $$invalidate(6, error = $$props.error);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		dispatch,
    		placeholder,
    		required,
    		value,
    		error,
    		textContent,
    		empty
    	});

    	$$self.$inject_state = $$props => {
    		if ("placeholder" in $$props) $$invalidate(0, placeholder = $$props.placeholder);
    		if ("required" in $$props) $$invalidate(1, required = $$props.required);
    		if ("value" in $$props) $$invalidate(5, value = $$props.value);
    		if ("error" in $$props) $$invalidate(6, error = $$props.error);
    		if ("textContent" in $$props) $$invalidate(2, textContent = $$props.textContent);
    		if ("empty" in $$props) $$invalidate(3, empty = $$props.empty);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*textContent*/ 4) {
    			$$invalidate(3, empty = textContent === "" ? true : false);
    		}
    	};

    	return [
    		placeholder,
    		required,
    		textContent,
    		empty,
    		dispatch,
    		value,
    		error,
    		blur_handler,
    		p_input_handler
    	];
    }

    class TextField extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			placeholder: 0,
    			required: 1,
    			value: 5,
    			error: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextField",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*required*/ ctx[1] === undefined && !("required" in props)) {
    			console.warn("<TextField> was created without expected prop 'required'");
    		}

    		if (/*value*/ ctx[5] === undefined && !("value" in props)) {
    			console.warn("<TextField> was created without expected prop 'value'");
    		}

    		if (/*error*/ ctx[6] === undefined && !("error" in props)) {
    			console.warn("<TextField> was created without expected prop 'error'");
    		}
    	}

    	get placeholder() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get error() {
    		throw new Error("<TextField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set error(value) {
    		throw new Error("<TextField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const server = 'http://localhost:4000';

    const getUser = async () => {
      return fetch(`${server}/user`, {
        credentials: 'include',
      })
        .then((response) => response.json())
        .then((data) => data.user?.displayName.split(' ')[0])
        .catch((err) => console.log(err));
    };

    const getSlugs = async (url) => {
      return fetch(`${server}/url`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })
        .then((res) => res.json())
        .then((data) => (data.message ? Promise.reject(data.message) : [data, null]))
        .catch((error) => {
          return [[{ slug: '' }], error];
        });
    };

    const newSlug = async ({ slug, url }) => {
      return fetch(`${server}/auth/newSlug`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug, url }),
      })
        .then((res) => res.json())
        .then((data) => (data.message ? Promise.reject(data.message) : data))
        .catch((error) => {
          return error;
        });
    };

    const newUser = async ({ name: displayName, googleId, email }) => {
      return fetch(`${server}/auth/newUser`, {
        credentials: 'include',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName, googleId, email }),
      })
        .then((res) => res.json())
        .then((data) => (data.message ? Promise.reject(data.message) : data))
        .catch((error) => {
          return error;
        });
    };

    /* src/views/Authorized.svelte generated by Svelte v3.38.3 */
    const file$1 = "src/views/Authorized.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i].name;
    	child_ctx[12] = list[i].placeholder;
    	child_ctx[13] = list[i].required;
    	child_ctx[2] = list[i].error;
    	child_ctx[14] = list[i].value;
    	child_ctx[15] = list;
    	child_ctx[16] = i;
    	return child_ctx;
    }

    // (54:2) {#each active.fields as { name, placeholder, required, error, value }
    function create_each_block(key_1, ctx) {
    	let p;
    	let t0_value = /*name*/ ctx[11] + "";
    	let t0;
    	let t1;
    	let textfield;
    	let current;

    	function save_handler(...args) {
    		return /*save_handler*/ ctx[8](/*value*/ ctx[14], /*each_value*/ ctx[15], /*each_index*/ ctx[16], ...args);
    	}

    	textfield = new TextField({
    			props: {
    				value: /*value*/ ctx[14],
    				placeholder: /*placeholder*/ ctx[12],
    				required: /*required*/ ctx[13],
    				error: /*error*/ ctx[2]
    			},
    			$$inline: true
    		});

    	textfield.$on("save", save_handler);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			p = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(textfield.$$.fragment);
    			attr_dev(p, "class", "svelte-1577r8b");
    			add_location(p, file$1, 54, 4, 2004);
    			this.first = p;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			insert_dev(target, t1, anchor);
    			mount_component(textfield, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*active*/ 2) && t0_value !== (t0_value = /*name*/ ctx[11] + "")) set_data_dev(t0, t0_value);
    			const textfield_changes = {};
    			if (dirty & /*active*/ 2) textfield_changes.value = /*value*/ ctx[14];
    			if (dirty & /*active*/ 2) textfield_changes.placeholder = /*placeholder*/ ctx[12];
    			if (dirty & /*active*/ 2) textfield_changes.required = /*required*/ ctx[13];
    			if (dirty & /*active*/ 2) textfield_changes.error = /*error*/ ctx[2];
    			textfield.$set(textfield_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			destroy_component(textfield, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(54:2) {#each active.fields as { name, placeholder, required, error, value }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let h1;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let button2;
    	let t8;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t9;
    	let button3;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*active*/ ctx[1].fields;
    	validate_each_argument(each_value);
    	const get_key = ctx => /*name*/ ctx[11];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			t0 = text("Welcome to your voyage, ");
    			t1 = text(/*user*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "New Short";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "New User";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "Logout";
    			t8 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			button3 = element("button");
    			button3.textContent = "Submit";
    			attr_dev(h1, "class", "svelte-1577r8b");
    			add_location(h1, file$1, 46, 0, 1509);
    			attr_dev(button0, "class", "logged-in-buttons new-slug svelte-1577r8b");
    			add_location(button0, file$1, 48, 2, 1576);
    			attr_dev(button1, "class", "logged-in-buttons new-user svelte-1577r8b");
    			add_location(button1, file$1, 49, 2, 1679);
    			attr_dev(button2, "class", "logged-in-buttons logout svelte-1577r8b");
    			add_location(button2, file$1, 50, 2, 1781);
    			attr_dev(div0, "class", "button-row svelte-1577r8b");
    			add_location(div0, file$1, 47, 0, 1549);
    			attr_dev(button3, "class", "submit svelte-1577r8b");
    			add_location(button3, file$1, 57, 2, 2142);
    			attr_dev(div1, "class", "fields svelte-1577r8b");
    			add_location(div1, file$1, 52, 0, 1899);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, button0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t9);
    			append_dev(div1, button3);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[5], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[6], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[7], false, false, false),
    					listen_dev(button3, "click", /*click_handler_3*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*user*/ 1) set_data_dev(t1, /*user*/ ctx[0]);

    			if (dirty & /*active*/ 2) {
    				each_value = /*active*/ ctx[1].fields;
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, outro_and_destroy_block, create_each_block, t9, get_each_context);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Authorized", slots, []);
    	let { user } = $$props;
    	let error = false;

    	let states = [
    		{
    			name: "slug",
    			fields: [
    				{
    					name: "slug",
    					placeholder: "goog",
    					required: false,
    					value: ""
    				},
    				{
    					name: "url",
    					placeholder: "www.google.com",
    					required: true,
    					value: ""
    				}
    			],
    			submit: async data => {
    				let dataPack = data.reduce(
    					(pack, field) => {
    						pack = {
    							...pack,
    							...{ [field.name]: field.value }
    						};

    						return pack;
    					},
    					{}
    				);

    				await newSlug(dataPack);
    			}
    		},
    		{
    			name: "user",
    			fields: [
    				{
    					name: "name",
    					placeholder: "John",
    					required: true,
    					value: ""
    				},
    				{
    					name: "googleId",
    					placeholder: "12345",
    					required: true,
    					value: ""
    				},
    				{
    					name: "email",
    					placeholder: "john@fakeemail.com",
    					required: false,
    					value: ""
    				}
    			],
    			submit: async data => {
    				let dataPack = data.reduce(
    					(pack, field) => {
    						pack = {
    							...pack,
    							...{ [field.name]: field.value }
    						};

    						return pack;
    					},
    					{}
    				);

    				await newUser(dataPack);
    			}
    		}
    	];

    	let active = states[0];
    	let activateState = target => $$invalidate(1, active = states.find(state => state.name === target));

    	let handleSubmit = async () => {
    		$$invalidate(2, error = active.fields.forEach(field => field.required && !field.value));
    		if (!error) await active.submit(active.fields);
    	};

    	const writable_props = ["user"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Authorized> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => activateState("slug");
    	const click_handler_1 = () => activateState("user");
    	const click_handler_2 = () => location.href = `${server}/logout`;
    	const save_handler = (value, each_value, each_index, { detail: content }) => $$invalidate(1, each_value[each_index].value = content, active);
    	const click_handler_3 = () => handleSubmit();

    	$$self.$$set = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		TextField,
    		server,
    		newSlug,
    		newUser,
    		user,
    		error,
    		states,
    		active,
    		activateState,
    		handleSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    		if ("error" in $$props) $$invalidate(2, error = $$props.error);
    		if ("states" in $$props) states = $$props.states;
    		if ("active" in $$props) $$invalidate(1, active = $$props.active);
    		if ("activateState" in $$props) $$invalidate(3, activateState = $$props.activateState);
    		if ("handleSubmit" in $$props) $$invalidate(4, handleSubmit = $$props.handleSubmit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		user,
    		active,
    		error,
    		activateState,
    		handleSubmit,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		save_handler,
    		click_handler_3
    	];
    }

    class Authorized extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Authorized",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*user*/ ctx[0] === undefined && !("user" in props)) {
    			console.warn("<Authorized> was created without expected prop 'user'");
    		}
    	}

    	get user() {
    		throw new Error("<Authorized>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Authorized>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.3 */
    const file = "src/App.svelte";

    // (49:50) 
    function create_if_block_1(ctx) {
    	let h1;
    	let t1;
    	let button0;
    	let t3;
    	let div;
    	let p;
    	let t5;
    	let textfield;
    	let t6;
    	let button1;
    	let t8;
    	let t9;
    	let t10;
    	let if_block2_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	textfield = new TextField({
    			props: {
    				value: /*search*/ ctx[5],
    				required: true,
    				error: /*error*/ ctx[6],
    				placeholder: "www.google.com"
    			},
    			$$inline: true
    		});

    	textfield.$on("save", /*save_handler*/ ctx[12]);
    	let if_block0 = /*retrievingData*/ ctx[8] && create_if_block_4(ctx);
    	let if_block1 = !/*retrievingData*/ ctx[8] && /*slugs*/ ctx[0][0].slug != "" && create_if_block_3(ctx);
    	let if_block2 = /*errorMessage*/ ctx[7] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Voyage Across the Web";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Login with Google";
    			t3 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = "or search by domain";
    			t5 = space();
    			create_component(textfield.$$.fragment);
    			t6 = space();
    			button1 = element("button");
    			button1.textContent = "Submit";
    			t8 = space();
    			if (if_block0) if_block0.c();
    			t9 = space();
    			if (if_block1) if_block1.c();
    			t10 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			attr_dev(h1, "class", "svelte-1jmuuk8");
    			add_location(h1, file, 49, 4, 1328);
    			attr_dev(button0, "class", "login svelte-1jmuuk8");
    			add_location(button0, file, 50, 4, 1363);
    			attr_dev(p, "class", "search-label svelte-1jmuuk8");
    			add_location(p, file, 52, 6, 1505);
    			attr_dev(div, "class", "search-container svelte-1jmuuk8");
    			add_location(div, file, 51, 4, 1468);
    			attr_dev(button1, "class", "submit svelte-1jmuuk8");
    			add_location(button1, file, 61, 4, 1758);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, button0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			append_dev(div, t5);
    			mount_component(textfield, div, null);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, button1, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t9, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t10, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler_1*/ ctx[11], false, false, false),
    					listen_dev(button1, "click", /*click_handler_2*/ ctx[13], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const textfield_changes = {};
    			if (dirty & /*search*/ 32) textfield_changes.value = /*search*/ ctx[5];
    			if (dirty & /*error*/ 64) textfield_changes.error = /*error*/ ctx[6];
    			textfield.$set(textfield_changes);

    			if (/*retrievingData*/ ctx[8]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(t9.parentNode, t9);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!/*retrievingData*/ ctx[8] && /*slugs*/ ctx[0][0].slug != "") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*retrievingData, slugs*/ 257) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t10.parentNode, t10);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*errorMessage*/ ctx[7]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_2(ctx);
    					if_block2.c();
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textfield.$$.fragment, local);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textfield.$$.fragment, local);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(button0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div);
    			destroy_component(textfield);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(button1);
    			if (detaching) detach_dev(t8);
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t9);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t10);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(if_block2_anchor);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(49:50) ",
    		ctx
    	});

    	return block;
    }

    // (47:2) {#if user && !authenticating && !serenity}
    function create_if_block(ctx) {
    	let authorized;
    	let current;

    	authorized = new Authorized({
    			props: { user: /*user*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(authorized.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(authorized, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const authorized_changes = {};
    			if (dirty & /*user*/ 8) authorized_changes.user = /*user*/ ctx[3];
    			authorized.$set(authorized_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(authorized.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(authorized.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(authorized, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(47:2) {#if user && !authenticating && !serenity}",
    		ctx
    	});

    	return block;
    }

    // (63:4) {#if retrievingData}
    function create_if_block_4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "loader svelte-1jmuuk8");
    			add_location(div, file, 63, 6, 1870);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(63:4) {#if retrievingData}",
    		ctx
    	});

    	return block;
    }

    // (66:4) {#if !retrievingData && slugs[0].slug != ''}
    function create_if_block_3(ctx) {
    	let div;
    	let leftarrow;
    	let t0;
    	let a;
    	let t1;
    	let t2_value = /*slugs*/ ctx[0][/*slugIndex*/ ctx[1]].slug + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let rightarrow;
    	let current;
    	leftarrow = new LeftArrow({ $$inline: true });
    	leftarrow.$on("decrement", /*decrement_handler*/ ctx[14]);
    	rightarrow = new RightArrow({ $$inline: true });
    	rightarrow.$on("increment", /*increment_handler*/ ctx[15]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(leftarrow.$$.fragment);
    			t0 = space();
    			a = element("a");
    			t1 = text("/");
    			t2 = text(t2_value);
    			t3 = space();
    			create_component(rightarrow.$$.fragment);
    			attr_dev(a, "href", a_href_value = "" + (server + "/" + /*slugs*/ ctx[0][/*slugIndex*/ ctx[1]].slug));
    			attr_dev(a, "class", "results svelte-1jmuuk8");
    			add_location(a, file, 68, 8, 2056);
    			attr_dev(div, "class", "slugs-container svelte-1jmuuk8");
    			add_location(div, file, 66, 6, 1958);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(leftarrow, div, null);
    			append_dev(div, t0);
    			append_dev(div, a);
    			append_dev(a, t1);
    			append_dev(a, t2);
    			append_dev(div, t3);
    			mount_component(rightarrow, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*slugs, slugIndex*/ 3) && t2_value !== (t2_value = /*slugs*/ ctx[0][/*slugIndex*/ ctx[1]].slug + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty & /*slugs, slugIndex*/ 3 && a_href_value !== (a_href_value = "" + (server + "/" + /*slugs*/ ctx[0][/*slugIndex*/ ctx[1]].slug))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(leftarrow.$$.fragment, local);
    			transition_in(rightarrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(leftarrow.$$.fragment, local);
    			transition_out(rightarrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(leftarrow);
    			destroy_component(rightarrow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:4) {#if !retrievingData && slugs[0].slug != ''}",
    		ctx
    	});

    	return block;
    }

    // (73:4) {#if errorMessage}
    function create_if_block_2(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*errorMessage*/ ctx[7]);
    			attr_dev(p, "class", "error svelte-1jmuuk8");
    			add_location(p, file, 73, 6, 2257);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errorMessage*/ 128) set_data_dev(t, /*errorMessage*/ ctx[7]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(73:4) {#if errorMessage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let button;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[3] && !/*authenticating*/ ctx[2] && !/*serenity*/ ctx[4]) return 0;
    		if (!/*user*/ ctx[3] && !/*authenticating*/ ctx[2] && !/*serenity*/ ctx[4]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			button = element("button");
    			button.textContent = "Serenity";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "class", "peace svelte-1jmuuk8");
    			toggle_class(button, "serenity", /*serenity*/ ctx[4]);
    			add_location(button, file, 45, 2, 1107);
    			attr_dev(main, "class", "svelte-1jmuuk8");
    			add_location(main, file, 44, 0, 1098);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, button);
    			append_dev(main, t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*serenity*/ 16) {
    				toggle_class(button, "serenity", /*serenity*/ ctx[4]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let authenticating = true;
    	let user;
    	let serenity = false;
    	let search = "";
    	let error = false;
    	let errorMessage;
    	let retrievingData = false;
    	let slugs = [{ slug: "" }];
    	let slugIndex = 0;

    	onMount(async () => {
    		$$invalidate(3, user = await getUser());
    		$$invalidate(2, authenticating = false);
    	});

    	let submitSearch = async () => {
    		$$invalidate(7, errorMessage = null);

    		if (search.length === 0) {
    			$$invalidate(6, error = true);
    			return [];
    		}

    		$$invalidate(8, retrievingData = true);
    		$$invalidate(0, [slugs, error] = await getSlugs(search), slugs, $$invalidate(6, error));
    		if (error) $$invalidate(7, errorMessage = error);
    		$$invalidate(8, retrievingData = false);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => $$invalidate(4, serenity = !serenity);
    	const click_handler_1 = () => location.href = `${server}/auth`;
    	const save_handler = ({ detail: content }) => $$invalidate(5, search = content);
    	const click_handler_2 = () => $$invalidate(0, slugs = submitSearch());
    	const decrement_handler = () => $$invalidate(1, slugIndex -= 1);
    	const increment_handler = () => $$invalidate(1, slugIndex += 1);

    	$$self.$capture_state = () => ({
    		onMount,
    		LeftArrow,
    		RightArrow,
    		TextField,
    		Authorized,
    		getSlugs,
    		getUser,
    		server,
    		authenticating,
    		user,
    		serenity,
    		search,
    		error,
    		errorMessage,
    		retrievingData,
    		slugs,
    		slugIndex,
    		submitSearch
    	});

    	$$self.$inject_state = $$props => {
    		if ("authenticating" in $$props) $$invalidate(2, authenticating = $$props.authenticating);
    		if ("user" in $$props) $$invalidate(3, user = $$props.user);
    		if ("serenity" in $$props) $$invalidate(4, serenity = $$props.serenity);
    		if ("search" in $$props) $$invalidate(5, search = $$props.search);
    		if ("error" in $$props) $$invalidate(6, error = $$props.error);
    		if ("errorMessage" in $$props) $$invalidate(7, errorMessage = $$props.errorMessage);
    		if ("retrievingData" in $$props) $$invalidate(8, retrievingData = $$props.retrievingData);
    		if ("slugs" in $$props) $$invalidate(0, slugs = $$props.slugs);
    		if ("slugIndex" in $$props) $$invalidate(1, slugIndex = $$props.slugIndex);
    		if ("submitSearch" in $$props) $$invalidate(9, submitSearch = $$props.submitSearch);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*slugIndex, slugs*/ 3) {
    			if (slugIndex < 0) {
    				$$invalidate(1, slugIndex = slugs.length - 1);
    			}
    		}

    		if ($$self.$$.dirty & /*slugIndex, slugs*/ 3) {
    			if (slugIndex > slugs.length - 1) {
    				$$invalidate(1, slugIndex = 0);
    			}
    		}
    	};

    	return [
    		slugs,
    		slugIndex,
    		authenticating,
    		user,
    		serenity,
    		search,
    		error,
    		errorMessage,
    		retrievingData,
    		submitSearch,
    		click_handler,
    		click_handler_1,
    		save_handler,
    		click_handler_2,
    		decrement_handler,
    		increment_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map

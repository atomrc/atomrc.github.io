---
title: "Recovering lost commits with git reflog"
tags: [git, cli]
excerpt: Any move you make in a git repository is recorded by git. Let's use this to our advantage and never lose a commit again!
lang: en
date: 2022-12-04
---

Once familiar with `git`, editing code becomes a breeze. Refactorings and deletions feel as natural and safe as adding code. `git` is always there to back us up if something goes awfully wrong!

But what about **editing the git history itself?**  
Could someone also have our back when we run `rebase` or `reset`?

The answer is "yes"! `git` has just the right for this job: the `reflog`!

Once you have built your own mental model of `reflog`, history-modifying commands become as natural and safe as editing code.

Before we actually dive in into what `reflog` is, we need to understand a key concept in `git`: the `HEAD`.

## What is `HEAD`?

The `HEAD` in `git` is a simple pointer of the commit that is currently checked out in your local work tree.

When digging a little further into the core of git, you realize that **pretty much anything is a reference to a commit in git**.
`branches`, `HEAD`, `stash` are all commit references.

A look into the `.git/refs` folder will reveal all those references:

- `.git/refs/heads/<branchname>` → points to the latest commit of the branch `<branchname>`
- `.git/refs/stash` → points to the latest commit on the `stash` (yes, the changes you stash are commits under the hood)
- `.git/refs/tags/<tagname>` → points to the commit referenced by the tag `<tagname>`

Along with it, you will find 2 more special commit references in the `.git/` folder

- `.git/HEAD` → the reference of the commit that is currently checked out in your local repository
- `.git/ORIG_HEAD` → the reference of the previous position of the HEAD (somewhat deprecated, `reflog` achieves the same goal and much more)

## What is the `reflog`?

The `reflog` is a quite simple concept, actually! It is a **log of all the moves the git `HEAD` has ever made** in your local repository.

As such, `reflog` is a very personal log that will never be shared with the remote repository. You will share the same commit history with your coworkers (modulus the commits that are not pushed) but your `reflog` is _yours only_.

## Which commands are moving the `HEAD`?

The rule of thumb is: if you move from one commit to another, then the `HEAD` is changing and a new entry is appended to the `reflog`.  
To be slightly more exhaustive, let's explain a few git commands with regard to what it does to the `HEAD`:

- `git commit` → creates a new commit and moves the `HEAD` to this commit
- `git checkout <branch>` → moves the `HEAD` from its current commit to the commit referenced by `<branch>`
- `git pull` → pulls the missing commits from the remote and moves the `HEAD` to the latest commit
- `git merge` → creates a merge commit and moves `HEAD` to point to this merge commit
- `git reset HEAD~1` → moves the `HEAD` to the previous commit
- ...

Every single of those moves will be inserted into the `reflog`.

<figure>
  <video controls alt="git reflog in action">
    <source src="https://i.imgur.com/sPAWe6v.mp4" type="video/mp4" />
  </video>
  <figcaption>On the left, you see some git commands being executed. On the right is the live <code>reflog</code></figcaption>
</figure>

Let's take a simple example in order to let the concept sink in.  
Imagine you are on branch `feature` and this is the initial state of the history:

```text
A initial commit &lt; <i>(HEAD, feature)</i>
```

Let's run a bunch of `git` commands on top of it

`git commit -m 'second commit'`: moves `HEAD` and `feature` to the newly created commit

```text
B second commit &lt; <i>(HEAD, feature)</i>
|
A initial commit
```

`git checkout A`: moves `HEAD` to commit `A` (but `feature` is still pointing to `B`)

```text
B second commit &lt; <i>(feature)</i>
|
A initial commit &lt; <i>(HEAD)</i>
```

`git checkout feature`: moves `HEAD` back to the commit referenced by `feature`

```text
B second commit &lt; <i>(HEAD, feature)</i>
|
A initial commit
```

`git reset A`: moves both `HEAD` and `feature` to commit `A`

```text
B second commit
|
A initial commit &lt; <i>(HEAD, feature)</i>
```

Every single of those moves will be recorded in the `reflog`.

## Real life example: recovering from a `reset`

Let's say you ran the examples commands that we saw earlier. You are in that state

```text
B
|
A &lt; <i>(HEAD, feature)</i>
```

Both `HEAD` and `feature` are pointing to `A` and you might feel that commit `B` is lost forever.

Fear not, commit `B` is all but lost. It has just become **unreachable** from the branches you have... But it still exists in `git`!

Unfortunately, commit hashes usually do not look like `A` but more something like `f1fec78c3a05708d7cb55d9e213f1ac51292b52f`.  
This makes it impossible, for a human at least, to just recall that hash and run `git reset <commithash>`.

That's where the `reflog` comes into play.

As we said earlier, every single move you make between commits is recorded in the `reflog`.  
So, let's have a look at that `reflog`:

```text
A HEAD@{0}: reset: moving to A
B HEAD@{1}: checkout: moving from A to feature
A HEAD@{2}: checkout: moving from feature to A
B HEAD@{3}: commit: second commit
```

The entire story of what happened in the previous example is just lying there. We can see everything we did in reverse chronology order (the most recent moves on the top). We can reconstruct the story just by reading this log from bottom to top.  
Most importantly, we now have the commit hash that we are interested in recovering: `B`.

So we have a few options to recover our commit:

```sh
git reset B # reseting our current branch to the commit hash we want
git reset HEAD@{1} # reset our current branch to the previous state of `HEAD`
git cherry-pick B # create a new commit on top of `feature` with the content of commit `B`
# last option is only if there is a single commit you want to recover
```

Recovering from a failed `rebase` is pretty much similar.  
It is just a matter of finding the previous top commit of the branch in the `reflog` and running `git reset <previous-top-commit-hash>`. You will find all the initial commits **exactly as they were before the rebase was initiated**.

## Conclusion

One thing you can keep in mind is: **There are no lost commits in git, only harder-to-reach ones!**
Once something is committed to `git`, it is here to stay! A hard-to-reach commit is just a `git reflog` away!

So, do not fear playing with `reset` or `rebase` in your feature branches and enjoy confident history rewritings\* 🤓! **Git is here to back you up!**

\*But please in mind that rewriting history of branches shared with coworkers is never a good idea ;)

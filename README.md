MuttrPod
========

A complete implementation of the Muttr *pod* protocol, ready to deploy.

Installation
------------

### Prerequisites

You will need to install Node.js and MongoDB in order to run MuttrPod. You can 
install MongoDB using your distribution's package manager.

```bash
$ aptitude install mongodb
```

Node.js can be installed using NVM (Node Version Manager).

```bash
$ curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.25.4/install.sh | bash
$ nvm install stable
$ nvm use stable
```

Clone the MuttrPod repostitory and install dependencies with NPM (Node Package 
Manager).

```bash
$ git clone https://github.com/muttr/muttrpod.git
$ cd muttrpod && npm install
```

Link the `muttrpod` executable to your `$PATH`.

```bash
npm link
```

Configuration
-------------

Before running the pod, you'll need to configure it. Copy the sample 
configuration file from the repository root somewhere.

```bash
$ cp config.example.json ~/.muttrpod.json
```

Open the file in your editor and setup your desired configuration. It is likely 
that you will want to add a known network seed like `muttr.me:44678`, replace 
the server address with your domain name, and add your SSL cert, key, and cert 
authority files.

If your database does not need a username or password, leave those fields blank.

Verbosity level relates to how loud the logs are. The levels are:

* 0 - silence
* 1 - errors
* 2 - warnings
* 3 - info
* 4 - debug

Running
-------

Once your configuration is setup, you can run the pod using the `muttrpod` 
program.

```bash
$ muttrpod start --config ~/.muttrpod.json
```

To keep your pod running on a remote host and restart it automatically if it 
goes down, you can use `forever`. Install it with NPM.

```bash
$ npm install -g forever
```

Start the pod with forever by giving it the path to the muttrpod executable.

```bash
$ forever start /muttrpod/bin/muttrpod.js start --config ~/.muttrpod.json
```

License
-------

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

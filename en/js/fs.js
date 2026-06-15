class FileSystem {
    constructor() {
        this.root = {
            name: '/',
            type: 'dir',
            parent: null,
            children: {}
        };
        this.currentDir = this.root;
        
        const savedFs = localStorage.getItem('tlcl_fs_en');
        if (savedFs) {
            try {
                this.importState(savedFs);
                this.migrateFS(); // Auto-inject newly added files
            } catch (e) {
                console.error("FS loading error:", e);
                this.initDefaultFS();
            }
        } else {
            this.initDefaultFS();
        }
    }

    initDefaultFS() {
        // Temel yapı
        const home = this.createDir('home', this.root);
        const user = this.createDir('user', home);
        const bin = this.createDir('bin', this.root);
        const usr = this.createDir('usr', this.root);
        const usrBin = this.createDir('bin', usr);
        const share = this.createDir('share', usr);
        const dict = this.createDir('dict', share);
        const etc = this.createDir('etc', this.root);

        // /etc dosyaları
        this.ensureFile('passwd', etc, 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\ngames:x:5:60:games:/usr/games:/usr/sbin/nologin\nman:x:6:12:man:/var/cache/man:/usr/sbin/nologin\nlp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin\nmail:x:8:8:mail:/var/mail:/usr/sbin/nologin\nnews:x:9:9:news:/var/spool/news:/usr/sbin/nologin\nuucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin\nproxy:x:13:13:proxy:/bin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nbackup:x:34:34:backup:/var/backups:/usr/sbin/nologin\nlist:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin\nirc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin\ngnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n_apt:x:100:65534::/nonexistent:/usr/sbin/nologin\nsystemd-network:x:101:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin\nsystemd-resolve:x:102:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin\nmessagebus:x:103:106::/nonexistent:/usr/sbin/nologin\nsystemd-timesync:x:104:107:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin\npollkitd:x:105:109:pollkit-daemon,,,:/var/lib/polkit1:/usr/sbin/nologin\nsshd:x:106:65534::/run/sshd:/usr/sbin/nologin');
        this.ensureFile('group', etc, 'root:x:0:\nuser:x:1000:\nbin:x:2:');
        this.ensureFile('hostname', etc, 'linux-sim-pro');
        this.ensureFile('os-release', etc, 'PRETTY_NAME="TLCL Simulator v2.0"\nNAME="TLCL-OS"\nID=tlcl\nID_LIKE=debian\nVERSION_ID="25.12"\nHOME_URL="https://linuxcommand.org/"');
        this.ensureFile('hosts', etc, '127.0.0.1\tlocalhost\n127.0.1.1\tlinux-sim-pro');

        const dictionaryWords = "apple\nbanana\ncherry\ndate\nelderberry\nfig\ngrape\nhoneydew\njackfruit\nkiwi\nlemon\nmango\norange\npapaya\nquince\nraspberry\nstrawberry\ntangerine\nvanilla\nwatermelon\nzucchini\nabandon\nability\nable\nabout\nabove\nabsent\nabsorb\nabstract\nabsurd\nabuse\nacademic\naccept\naccess\naccident\naccompany\naccomplish\naccount\naccurate\naccuse\nachieve\nacid\nacoustic\nacquire\nacross\nact\naction\nactor\nactress\nactual\nadapt\nadd\naddict\naddress\nadjust\nadmit\nadult\nadvance\nadvice\nadviser\nadvocate\naffair\naffect\nafford\nafraid\nafter\nagain\nagainst\nage\nagency\nagenda\nagent\nagree\nahead\naid\naim\nair\nairport\nalarm\nalbum\nalcohol\nalert\nalien\nalike\nalive\nall\nalley\nallow\nalmost\nalone\nalong\naloud\nalphabet\nalready\nalso\nalter\nalways\namaze\nambition\nambulance\namount\namuse\nanalysis\nanatomy\nancestor\nanchor\nancient\nanger\nangle\nangry\nanimal\nankle\nannounce\nannual\nanother\nanswer\nantenna\nantique\nanxiety\nany\napartment\napology\napparatus\nappeal\nappear\nappendix\napply\nappoint\napprove\napril\narch\narchive\narea\narena\nargue\narm\narmed\narmor\narmy\naround\narrange\narrest\narrive\narrow\nart\narticle\nartist";
        this.ensureFile('words', dict, dictionaryWords);
        this.ensureFile('wordlist.txt', user, dictionaryWords); // For array-mapfile

        // Sample files
        this.ensureFile('readme.txt', user, 'Welcome to the TLCL Training!\nThis training is fully compatible with William Shotts\' book.');
        this.ensureFile('notes.txt', user, 'Linux is everything.');
        
        // Gizli Dosyalar (Bölüm 3 testi için)
        this.ensureFile('.bashrc', user, '# .bashrc\nalias ll="ls -l"');
        this.ensureFile('.profile', user, '# .profile\nexport PATH=$PATH:~/bin');
        this.ensureFile('.bash_history', user, 'ls -a\npwd\nclear');
        
        // Bölüm 19-20 Verileri
        const distrosContent = `SUSE\t10.2\t12/07/2006
Fedora\t10\t11/25/2008
Ubuntu\t8.04\t04/24/2008
Debian\t5.0\t02/14/2009
Ubuntu\t9.10\t10/29/2009
Fedora\t12\t11/17/2009
SUSE\t11.1\t12/18/2008`;
        this.ensureFile('distros.txt', user, distrosContent);

        // Scripts Klasörü
        const scripts = this.createDir('scripts', user);
        
        this.ensureFile('hello.sh', scripts, '#!/bin/bash\necho "Hello World!"');
        
        this.ensureFile('sys_info_page', scripts, `#!/bin/bash
# Program to output a system information page
TITLE="System Information Report For $HOSTNAME"
CURRENT_TIME=$(date +"%x %r %Z")
TIMESTAMP="Generated $CURRENT_TIME, by $USER"
report_uptime () {
    uptime
}
report_disk_usage () {
    df -h
}
cat << _EOF_
<html>
<head><title>$TITLE</title></head>
<body>
<h1>$TITLE</h1>
<p>$TIMESTAMP</p>
$(report_uptime)
$(report_disk_usage)
</body>
</html>
_EOF_`);

        this.ensureFile('while-count', scripts, `#!/bin/bash
count=1
while [ $count -le 5 ]; do
    echo $count
    count=$((count + 1))
done
echo "Finished."`);

        this.ensureFile('case-menu', scripts, `#!/bin/bash
clear
echo "1. Display System Information"
echo "2. Display Disk Usage"
echo "0. Quit"
read -p "Enter selection [0-2] > "
case $REPLY in
    0) echo "Program terminated." ;;
    1) uptime ;;
    2) df -h ;;
    *) echo "Invalid entry." ;;
esac`);

        this.ensureFile('posit-param', scripts, `#!/bin/bash
echo "Number of arguments: $#"
echo "All arguments: $@"
echo "Arg 1: $1"`);

        this.ensureFile('arith-loop', scripts, `#!/bin/bash
finished=0
a=0
printf "a\\ta**2\\ta**3\\n"
printf "=\\t====\\t====\\n"
until ((finished)); do
	b=$((a**2))
	c=$((a**3))
	printf "%d\\t%d\\t%d\\n" $a $b $c
	((a<10?++a:(finished=1)))	
done`);

        this.ensureFile('arith-loop2', scripts, `#!/bin/bash
a=0
printf "a\\ta**2\\ta**3\\n"
printf "=\\t====\\t====\\n"
until (( a++, b=a**2, c=a**3, a>10 )); do
  printf "%d\\t%d\\t%d\\n" $a $b $c
done`);

        this.ensureFile('test-integer', scripts, `#!/bin/bash
# test-integer: evaluate the value of an integer.
INT=-5
if [[ "$INT" =~ ^-?[0-9]+$ ]]; then
    if [ $INT -eq 0 ]; then
        echo "INT is zero."
    else
        if [ $INT -lt 0 ]; then
            echo "INT is negative."
        else
            echo "INT is positive."
        fi
        if [ $((INT % 2)) -eq 0 ]; then
            echo "INT is even."
        else
            echo "INT is odd."
        fi
    fi
else
    echo "INT is not an integer." >&2
    exit 1
fi`);

        this.ensureFile('test-string', scripts, `#!/bin/bash
# test-string: evaluate the value of a string.
ANSWER=maybe
if [ -z "$ANSWER" ]; then
    echo "There is no answer." >&2
    exit 1
fi
if [ "$ANSWER" = "yes" ]; then
    echo "The answer is YES."
elif [ "$ANSWER" = "no" ]; then
    echo "The answer is NO."
elif [ "$ANSWER" = "maybe" ]; then
    echo "The answer is MAYBE."
else
    echo "The answer is UNKNOWN."
fi`);

        this.ensureFile('read-menu', scripts, `#!/bin/bash
# read-menu: a menu driven system information program
clear
echo "
Please Select:
1. Display System Information
2. Display Disk Usage
3. Display Home Space Utilization
0. Quit
"
read -p "Enter selection [0-3] > " selection
if [ "$selection" = "1" ]; then
    uptime
elif [ "$selection" = "2" ]; then
    df -h
elif [ "$selection" = "3" ]; then
    if [ $(id -u) -eq 0 ]; then
        echo "Home Space Utilization (All Users)"
        du -sh /home/*
    else
        echo "Home Space Utilization ($USER)"
        du -sh $HOME
    fi
elif [ "$selection" = "0" ]; then
    echo "Program terminated."
else
    echo "Invalid entry." >&2
    exit 1
fi`);

        this.ensureFile('array-lookup', scripts, `#!/bin/bash
declare -A cmds
cd /usr/bin || exit 1
echo "Loading commands..."
for i in ./*; do
  cmds["$i"]=1024
done
echo "\${#cmds[@]} commands loaded"
while true; do
  read -r -p "Enter command (empty to quit) -> "
  [[ -z $REPLY ]] && break
  echo "$REPLY" "\${cmds[./$REPLY]}" "bytes"
done`);

        this.ensureFile('array-mapfile', scripts, this.arrayMapfileScript());

        this.ensureFile('array-multi', scripts, `#!/bin/bash
declare -A multi_array
counter=1
for row in {1..10}; do
  for col in {1..5}; do
    address="$row, $col"
    multi_array["$address"]=$counter
    ((counter++))
  done
done
for row in {1..10}; do
  for col in {1..5}; do
    address="$row, $col"
    echo -ne "\${multi_array["$address"]}" "\\t"
  done
  echo
done`);

        this.ensureFile('array-sort', scripts, `#!/bin/bash
a=(f e d c b a)
echo "Original array: " "\${a[@]}"
a_sorted=($(for i in "\${a[@]}"; do echo "$i"; done | sort))
echo "Sorted array:   " "\${a_sorted[@]}"`);

        this.ensureFile('async-child', scripts, `#!/bin/bash
echo "Child: child is running..."
sleep 5
echo "Child: child is done.  Exiting."`);

        this.ensureFile('async-parent', scripts, `#!/bin/bash
echo "Parent: starting..."
async-child &
pid=$!
echo "Parent: child (PID= $pid) launched."
sleep 2
wait $pid
echo "Parent: child is finished.  Continuing..."`);

        this.ensureFile('average', scripts, `#!/bin/bash
c=0
{ echo "t = 0; scale = 2"
  while read -r value; do
    if [[ $value =~ ^[-+]?[0-9]*\\.?[0-9]+$ ]]; then
      echo "t += $value"
      ((++c))
    fi
  done
  ((c)) && echo "t / $c"
} | bc`);

        this.ensureFile('eval-wordle', scripts, `#!/bin/bash
usage() { printf "%s\\n" "Usage: eval-wordle regex +-char..."; }
if (( "\${#1}" == 5 )); then
  known_chars="$1"
  shift
else
  usage; exit 1
fi
cmd="grep '^.....$' /usr/share/dict/words | grep '$known_chars'"
eval "$cmd"`);

        this.ensureFile('file-info', scripts, `#!/bin/bash
PROGNAME="$(basename "$0")"
if [[ -e "$1" ]]; then
	file "$1"
	stat "$1"
else
	echo "$PROGNAME: usage: $PROGNAME file" >&2
	exit 1
fi`);

        this.ensureFile('getopts-test', scripts, `#!/bin/bash
while getopts :f:ih opt; do
    case "$opt" in
        f)  filename="$OPTARG" ;;
        i)  interactive=1 ;;
    esac
done
echo "interactive = '$interactive' filename = '$filename'"`);

        this.ensureFile('hours', scripts, `#!/bin/bash
for i in {0..23}; do hours[i]=0; done 
for i in $(stat -c %y "$1"/* | cut -c 12-13); do
	j="\${i/#0}"
	((++hours[j]))
done
echo -e "Hour\\tFiles"
for i in {0..23}; do printf "%02d\\t%d\\n" "$i" "\${hours[i]}"; done`);

        this.ensureFile('loan-calc', scripts, `#!/bin/bash
principal=$1; interest=$2; months=$3
bc <<- EOF
	scale = 10 
	i = $interest / 12
	p = $principal
	n = $months
	a = p * ((i * ((1 + i) ^ n)) / (((1 + i) ^ n) - 1))
	print a, "\\n"
EOF`);

        this.ensureFile('local-vars', scripts, `#!/bin/bash
# local-vars: script to demonstrate local variables
foo=0 # global variable
funct_1 () {
    local foo # variable foo is local to funct_1
    foo=1
    echo "funct_1: foo = $foo"
}
funct_2 () {
    local foo # variable foo is local to funct_2
    foo=2
    echo "funct_2: foo = $foo"
}
echo "global: foo = $foo"
funct_1
echo "global: foo = $foo"
funct_2
echo "global: foo = $foo"`);

    this.ensureFile('longest-word', scripts, `#!/bin/bash
for i; do
    if [[ \${#i} -gt \${#max_word} ]]; then max_word=$i; fi
done
echo "Longest: $max_word"`);

        this.ensureFile('modulo', scripts, `#!/bin/bash
for ((i = 0; i <= 20; i++)); do
	if (( (i % 5) == 0 )); then printf "<%d> " $i; else printf "%d " $i; fi
done`);

        this.ensureFile('read-ifs', scripts, `#!/bin/bash
read -r -p "Enter a user name > " user_name
file_info="$(grep "^$user_name:" /etc/passwd)"
IFS=":" read user pw uid gid name home shell <<< "$file_info"
echo "User = '$user' Home = '$home'"`);

        this.ensureFile('read-integer', scripts, `#!/bin/bash
read -p "Enter number: " int
if [[ "$int" =~ ^-?[0-9]+$ ]]; then
    if [ "$int" -lt 0 ]; then echo "Negative"; else echo "Positive"; fi
fi`);

        this.ensureFile('read-secret', scripts, `#!/bin/bash
read -r -sp "Password: " pass
echo -e "\\nYour password: $pass"`);

        this.ensureFile('read-validate', scripts, `#!/bin/bash
read -r -p "Input: "
if [[ "$REPLY" =~ ^[a-zA-Z0-9]+$ ]]; then echo "Valid"; fi`);

        this.ensureFile('trap-demo', scripts, `#!/bin/bash
trap "echo 'Interrupted'" SIGINT
for i in {1..5}; do echo "Iter $i"; sleep 1; done`);

        this.ensureFile('until-count', scripts, `#!/bin/bash
count=1
until [[ "$count" -gt 5 ]]; do echo "$count"; count=$((count + 1)); done`);

        this.ensureFile('while-menu', scripts, `#!/bin/bash
# while-menu: a menu driven system information program
DELAY=3 # Number of seconds to display results
while [[ "$REPLY" != 0 ]]; do
	clear
	cat <<- _EOF_
		Please Select:

		1. Display System Information
		2. Display Disk Space
		3. Display Home Space Utilization
		0. Quit

	_EOF_
	read -r -p "Enter selection [0-3] > "

	if [[ "$REPLY" =~ ^[0-3]$ ]]; then
		if [[ "$REPLY" == 1 ]]; then
			echo "Hostname: $HOSTNAME"
			uptime
			sleep "$DELAY"
		fi
		if [[ "$REPLY" == 2 ]]; then
			df -h
			sleep "$DELAY"
		fi
		if [[ "$REPLY" == 3 ]]; then
			if [[ "$(id -u)" -eq 0 ]]; then
				echo "Home Space Utilization (All Users)"
				du -sh /home/*
			else
				echo "Home Space Utilization ($USER)"
				du -sh "$HOME"
			fi
			sleep "$DELAY"
		fi
	else
		echo "Invalid entry."
		sleep "$DELAY"
	fi
done
echo "Program terminated."`);

        this.ensureFile('while-read', scripts, `#!/bin/bash
while read -r distro ver rel; do
    echo "Distro: $distro"
done < distros.txt`);

        this.ensureFile('while-read2', scripts, `#!/bin/bash
sort -k 1,1 -k 2n distros.txt | while read -r distro ver rel; do
    echo "Distro: $distro"
done`);

        this.ensureFile('longest-word2', scripts, `#!/bin/bash
for i; do
    if [[ -r "$i" ]]; then
        max_word=; max_len=0
        for j in $(strings "$i"); do
            len=$(echo -n "$j" | wc -c)
            if (( len > max_len )); then max_len="$len"; max_word="$j"; fi
        done
        echo "$i: '$max_word' ($max_len characters)"
    fi
done`);

        this.ensureFile('longest-word3', scripts, `#!/bin/bash
for i; do
    if [[ -r "$i" ]]; then
        max_word=; max_len=0
        for j in $(strings "$i"); do
            len="\${#j}"
            if (( len > max_len )); then max_len="$len"; max_word="$j"; fi
        done
        echo "$i: '$max_word' ($max_len characters)"
    fi
done`);

        this.ensureFile('test-integer2', scripts, `#!/bin/bash
INT=-5
if [[ "$INT" =~ ^-?[0-9]+$ ]]; then
    if [ "$INT" -eq 0 ]; then echo "Zero"; elif [ "$INT" -lt 0 ]; then echo "Negative"; else echo "Positive"; fi
fi`);

        this.ensureFile('test-integer3', scripts, `#!/bin/bash
MIN=1; MAX=100; INT=50
if [[ "$INT" =~ ^-?[0-9]+$ ]]; then
    if [[ "$INT" -ge "$MIN" && "$INT" -le "$MAX" ]]; then echo "In range"; else echo "Out of range"; fi
fi`);

        this.ensureFile('test-integer4', scripts, `#!/bin/bash
MIN=1; MAX=100; INT=50
if [[ "$INT" =~ ^-?[0-9]+$ ]]; then
    if [[ ! ("$INT" -ge "$MIN" && "$INT" -le "$MAX") ]]; then echo "Outside"; else echo "Inside"; fi
fi`);

        this.ensureFile('trap-demo2', scripts, `#!/bin/bash
exit_on_signal_SIGINT () { echo "Interrupted"; exit 0; }
trap exit_on_signal_SIGINT SIGINT
for i in {1..5}; do echo "Iter $i"; sleep 2; done`);

        this.ensureFile('trap-demo3', scripts, `#!/bin/bash
trap "echo 'Error occurred'" ERR
trap "echo 'Program ended'" EXIT
ls-nonexistent`);

        this.ensureFile('ul-param', scripts, `#!/bin/bash
if [[ "$1" ]]; then
    echo "\${1,,}"; echo "\${1,}"; echo "\${1^^}"; echo "\${1^}"
fi`);

        this.ensureFile('posit-param2', scripts, `#!/bin/bash
count=1
while [[ $# -gt 0 ]]; do
    echo "Argument $count = $1"
    count=$((count + 1)); shift
done`);

        this.ensureFile('posit-param3', scripts, `#!/bin/bash
print_params () { echo "$1 = $1"; echo "$2 = $2"; }
pass_params () { print_params $*; print_params "$*"; print_params $@; print_params "$@"; }
pass_params "word" "words with spaces"`);

        this.ensureFile('modulo2', scripts, `#!/bin/bash
for ((i = 0; i <= 20; ++i )); do
	if (((i % 5) == 0 )); then printf "<%d> " "$i"; else printf "%d " "$i"; fi
done`);

        this.ensureFile('while-menu2', scripts, `#!/bin/bash
while true; do
    echo "1. System\\n0. Quit"
    read -r -p "> "
    [[ "$REPLY" == 0 ]] && break
    uptime; continue
done`);

        this.ensureFile('read-multiple', scripts, `#!/bin/bash
echo -n "Enter name and age > "
read name age
echo "You entered: Name=$name, Age=$age"`);

        this.ensureFile('read-single', scripts, `#!/bin/bash
echo -n "Enter values > "
read
echo "REPLY = '$REPLY'"`);

        // Diğer sistem dosyaları (Simülasyon)
        this.ensureFile('bash', bin, 'BINARY_DATA');
        this.ensureFile('ls', bin, 'BINARY_DATA');
        this.ensureFile('zip', usrBin, 'BINARY_DATA');

        this.currentDir = user;
        this.saveState();
    }

    exportState() {
        const sanitize = (node) => {
            const copy = { ...node };
            delete copy.parent;
            if (copy.children) {
                const newChildren = {};
                for (let key in copy.children) {
                    newChildren[key] = sanitize(copy.children[key]);
                }
                copy.children = newChildren;
            }
            return copy;
        };
        return JSON.stringify(sanitize(this.root));
    }

    importState(jsonString) {
        const parsed = JSON.parse(jsonString);
        const rebuild = (node, parent) => {
            node.parent = parent;
            if (node.children) {
                for (let key in node.children) {
                    rebuild(node.children[key], node);
                }
            }
        };
        rebuild(parsed, null);
        this.root = parsed;
        
        let userDir = this.resolvePath('/home/user');
        this.currentDir = userDir || this.root;
    }

    saveState() {
        localStorage.setItem('tlcl_fs_en', this.exportState());
    }

    resolvePath(path) {
        if (!path) return this.currentDir;
        
        let normalizedPath = path;
        if (path === '~' || path.startsWith('~/')) {
            normalizedPath = path.replace('~', '/home/user');
        }
        
        let curr = normalizedPath.startsWith('/') ? this.root : this.currentDir;
        const parts = normalizedPath.split('/').filter(p => p.length > 0);
        
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') {
                if (curr.parent) curr = curr.parent;
            } else {
                if (curr.type !== 'dir') return null;
                if (!curr.children[part]) return null;
                curr = curr.children[part];
            }
        }
        return curr;
    }

    pwd() {
        let path = '';
        let curr = this.currentDir;
        while (curr !== null) {
            path = (curr.name === '/' ? '' : '/' + curr.name) + path;
            curr = curr.parent;
        }
        return path || '/';
    }

    cd(path) {
        if (!path || path === '~') {
            const homeUser = this.resolvePath('/home/user');
            if (homeUser) {
                this.currentDir = homeUser;
                return { success: true };
            }
        }
        const target = this.resolvePath(path);
        if (!target) return { success: false, error: `cd: ${path}: No such file or directory` };
        if (target.type !== 'dir') return { success: false, error: `cd: ${path}: Not a directory` };
        this.currentDir = target;
        return { success: true };
    }

    mkdir(path) {
        const parts = path.split('/');
        const name = parts.pop();
        const parentPath = parts.join('/') || '.';
        const parent = this.resolvePath(parentPath);
        
        if (!parent || parent.type !== 'dir') return { success: false, error: `mkdir: cannot create directory '${path}': No such file or directory` };
        if (parent.children[name]) return { success: false, error: `mkdir: cannot create directory '${name}': File exists` };
        
        const dir = {
            name,
            type: 'dir',
            parent,
            children: {},
            owner: 'user',
            group: 'user',
            permissions: 'rwxr-xr-x',
            date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
        };
        parent.children[name] = dir;
        this.saveState();
        return { success: true };
    }

    createDir(name, parent) {
        if (parent.children[name]) return parent.children[name];
        const dir = { 
            name, type: 'dir', parent, children: {}, owner: 'user', group: 'user', permissions: 'rwxr-xr-x',
            date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
        };
        parent.children[name] = dir;
        return dir;
    }

    createFile(name, parent, content = '') {
        const file = {
            name, type: 'file', parent, content, owner: 'user', group: 'user', permissions: 'rw-r--r--',
            date: new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '')
        };
        parent.children[name] = file;
        return file;
    }

    ensureFile(name, parent, content = '') {
        if (parent && parent.children && parent.children[name]) {
            return parent.children[name];
        }
        return this.createFile(name, parent, content);
    }

    touch(path) {
        const parts = path.split('/');
        const name = parts.pop();
        const parentPath = parts.join('/') || '.';
        const parent = this.resolvePath(parentPath);
        if (!parent || parent.type !== 'dir') return { success: false, error: `touch: cannot touch '${path}': No such file or directory` };
        
        if (parent.children[name]) {
            parent.children[name].date = new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(',', '');
        } else {
            this.createFile(name, parent, '');
        }
        this.saveState();
        return { success: true };
    }

    readFile(path) {
        const target = this.resolvePath(path);
        if (!target) return { success: false, error: `${path}: No such file or directory` };
        if (target.type === 'dir') return { success: false, error: `${path}: Is a directory` };
        return { success: true, output: target.content };
    }

    writeFile(path, content) {
        const parts = path.split('/');
        const name = parts.pop();
        const parentPath = parts.join('/') || '.';
        const parent = this.resolvePath(parentPath);
        if (!parent || parent.type !== 'dir') return { success: false, error: `bash: ${path}: No such file or directory` };
        this.createFile(name, parent, content);
        this.saveState();
        return { success: true };
    }

    rm(path, options = { recursive: false, force: false }) {
        const target = this.resolvePath(path);
        if (!target) {
            return options.force ? { success: true } : { success: false, error: `rm: cannot remove '${path}': No such file or directory` };
        }
        if (target === this.root) return { success: false, error: "rm: cannot remove root directory" };
        if (target.type === 'dir' && !options.recursive) return { success: false, error: `rm: cannot remove '${path}': Is a directory` };
        
        delete target.parent.children[target.name];
        this.saveState();
        return { success: true };
    }

    cp(sourcePath, destPath) {
        const source = this.resolvePath(sourcePath);
        if (!source) return { success: false, error: `cp: cannot stat '${sourcePath}': No such file or directory` };
        if (source.type === 'dir') return { success: false, error: "cp: -r not implemented for mock" };

        let destParent, destName;
        const dest = this.resolvePath(destPath);
        if (dest && dest.type === 'dir') {
            destParent = dest;
            destName = source.name;
        } else {
            const parts = destPath.split('/');
            destName = parts.pop();
            const parentPath = parts.join('/') || '.';
            destParent = this.resolvePath(parentPath);
        }
        if (!destParent) return { success: false, error: `cp: cannot create regular file '${destPath}': No such file or directory` };
        
        this.createFile(destName, destParent, source.content);
        this.saveState();
        return { success: true };
    }

    mv(sourcePath, destPath) {
        const source = this.resolvePath(sourcePath);
        if (!source) return { success: false, error: `mv: cannot stat '${sourcePath}': No such file or directory` };
        
        let destParent, destName;
        const dest = this.resolvePath(destPath);
        if (dest && dest.type === 'dir') {
            destParent = dest;
            destName = source.name;
        } else {
            const parts = destPath.split('/');
            destName = parts.pop();
            const parentPath = parts.join('/') || '.';
            destParent = this.resolvePath(parentPath);
        }
        if (!destParent) return { success: false, error: `mv: cannot move to '${destPath}': No such file or directory` };
        
        delete source.parent.children[source.name];
        source.parent = destParent;
        source.name = destName;
        destParent.children[destName] = source;
        this.saveState();
        return { success: true };
    }

    // 'array-mapfile' sample script (Chapter 35: Arrays). Both initDefaultFS and
    // migrateFS use this single source. The old version contained an interactive
    // 'read' loop that froze the browser in the simulator; this version is not
    // interactive.
    arrayMapfileScript() {
        return `#!/bin/bash
# array-mapfile: read a text file into an array (mapfile) and show its elements
WORDLIST=~/wordlist.txt
mapfile -t words < "$WORDLIST"
echo "wordlist.txt has been read into the 'words' array."
echo "Total elements: \${#words[@]}"
echo "First four elements: \${words[0]} \${words[1]} \${words[2]} \${words[3]}"
echo "Eleventh element: \${words[10]}"`;
    }

    migrateFS() {
        // Auto-inject missing base files or files added later
        const savedCurrentDirName = this.pwd();
        this.initDefaultFS();

        // Refresh the old interactive array-mapfile script (infinite read loop that
        // froze the browser) for users whose FS is already saved in localStorage.
        const arrayMapfile = this.resolvePath('/home/user/scripts/array-mapfile');
        if (arrayMapfile && arrayMapfile.type === 'file' &&
            /while\s*\[\[\s*-z\s*\$REPLY/.test(arrayMapfile.content || '')) {
            arrayMapfile.content = this.arrayMapfileScript();
        }

        const restoredDir = this.resolvePath(savedCurrentDirName);
        if (restoredDir) {
            this.currentDir = restoredDir;
        }
        this.saveState();
    }
}

window.fs = new FileSystem();

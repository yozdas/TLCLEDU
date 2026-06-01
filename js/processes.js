class ProcessManager {
    constructor() {
        this.jobs = [];
        this.nextJobId = 1;
    }

    addJob(command, terminal) {
        const job = {
            id: this.nextJobId++,
            command: command,
            status: 'Running',
            startTime: new Date()
        };
        this.jobs.push(job);
        
        // Simulate background execution
        // Since we are in a single-threaded JS environment, we just log it
        terminal.printLine(`[${terminal.escapeHTML(job.id)}] ${terminal.escapeHTML(job.command)} &`);
        
        // Some jobs might "finish" automatically for simulation
        if (!command.includes('sleep')) {
            setTimeout(() => {
                job.status = 'Done';
                // Note: Real bash prints 'Done' on next prompt, we can just update status
            }, 2000);
        }
        
        return job;
    }

    getJobs() {
        return this.jobs.map(j => `[${j.id}]  ${j.status}              ${j.command}`).join('\n');
    }

    killJob(id) {
        const idx = this.jobs.findIndex(j => j.id === id);
        if (idx !== -1) {
            this.jobs.splice(idx, 1);
            return true;
        }
        return false;
    }

    getProcesses() {
        const currentUser = (window.terminal && window.terminal.env && window.terminal.env.USER) || 'user';
        return [
            { pid: 1, name: 'systemd', user: 'root', cpu: 0.0, mem: 0.1 },
            { pid: 2, name: 'kthreadd', user: 'root', cpu: 0.0, mem: 0.0 },
            { pid: 124, name: 'systemd-journal', user: 'root', cpu: 0.1, mem: 0.4 },
            { pid: 156, name: 'systemd-udevd', user: 'root', cpu: 0.0, mem: 0.2 },
            { pid: 485, name: 'sshd', user: 'root', cpu: 0.0, mem: 0.3 },
            { pid: 512, name: 'bash', user: currentUser, cpu: 0.0, mem: 0.5 },
            { pid: 615, name: 'ps', user: currentUser, cpu: 0.1, mem: 0.2 }
        ];
    }

    killProcess(pid) {
        const pidNum = parseInt(pid);
        if (isNaN(pidNum)) return { error: "kill: geçersiz PID" };
        if (pidNum === 1 || pidNum === 2) return { error: "kill: Bu işlemi sonlandırmak için yetkiniz yok (Sistem süreci)" };
        return { success: true };
    }
}

window.processManager = new ProcessManager();

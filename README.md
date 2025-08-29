# LaunchMate 🚀
**Product Launch Intelligent Agent**  

LaunchMate is a collaborative project designed to automate and manage product launches intelligently.

---

## 🧑‍💻 Collaboration Guidelines

### Branching
- **main** → Stable, production-ready code.
- **feature/<your-name>** → Your personal feature branch.  
  Example: `feature/bhanu-product-intake`

---

### Workflow

1. **Update main branch**
```bash
git checkout main
git pull origin main
```
2. **Create your feature branch**
```sh
git checkout -b feature/<your-branch>
```

3.**Commit & push your changes**
```sh
git add .
git commit -m "Brief message about your changes"
git push origin feature/<your-branch>
```

4.**Keep your branch updated with main**
```sh
git checkout main
git pull origin main
git checkout feature/<your-branch>
git merge main
```
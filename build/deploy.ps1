yarn build
cd dist
git init 
git add -A
git commit -m '[auto]  deploy'
git remote add origin https://github.com/minskiter/EntityExplorer.git
git checkout -b gh-pages
git push -u origin gh-pages --force
cd -
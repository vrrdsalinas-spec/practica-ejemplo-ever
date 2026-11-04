pipeline {
    agent any

    parameters {
        string(name: 'GIT_REPO_URL', defaultValue: '', description: 'URL del repositorio Git (detectada automáticamente si se omite)')
        string(name: 'GIT_BRANCH', defaultValue: 'develop', description: 'Rama Git a auditar')
    }

    tools {
        nodejs 'Node-20'
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        ansiColor('xterm')
    }

    environment {
        CI = 'true'
        NEXT_TELEMETRY_DISABLED = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    // 1. Resolver URL del repositorio de forma dinámica
                    def repoUrl = (params.GIT_REPO_URL?.trim()) ?: (env.GIT_URL?.trim() ?: '')
                    if (!repoUrl) {
                        try {
                            repoUrl = scm.getUserRemoteConfigs()[0].getUrl()
                        } catch (Exception e) {
                            repoUrl = ''
                        }
                    }

                    // 2. Resolver rama de forma dinámica
                    def targetBranch = (params.GIT_BRANCH?.trim()) ?: (env.GIT_BRANCH?.trim() ?: (env.BRANCH_NAME?.trim() ?: 'develop'))
                    targetBranch = targetBranch.replace('origin/', '').trim()
                    env.AUDITED_BRANCH = targetBranch

                    // 3. Metadata dinámica de la compilación en la interfaz de Jenkins
                    currentBuild.displayName = "#${currentBuild.number} [Rama: ${targetBranch}]"
                    currentBuild.description = "Repo: ${repoUrl ?: 'SCM Jenkins'} | Rama: ${targetBranch}"

                    echo '=================================================='
                    echo "🚀 [Etapa 1/4] Descarga Dinámica de Código"
                    echo "📂 Repositorio: ${repoUrl ?: 'Configurado en SCM'}"
                    echo "🌿 Rama: ${targetBranch}"
                    echo '=================================================='

                    // 4. Clonar repositorio dinámicamente
                    if (repoUrl) {
                        git branch: targetBranch, url: repoUrl
                    } else {
                        checkout scm
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '=================================================='
                echo '📦 [Etapa 2/4] Instalando dependencias con npm ci'
                echo '=================================================='
                script {
                    if (isUnix()) {
                        sh 'npm ci'
                    } else {
                        bat 'npm ci'
                    }
                }
            }
        }

        stage('Lint & Unit Tests') {
            steps {
                echo '=================================================='
                echo '🧪 [Etapa 3/4] Ejecutando Linter y Pruebas Unitarias'
                echo '=================================================='
                script {
                    if (isUnix()) {
                        sh 'npm run lint'
                        sh 'npm test'
                    } else {
                        bat 'npm run lint'
                        bat 'npm test'
                    }
                }
            }
        }

        stage('Build Verification') {
            steps {
                echo '=================================================='
                echo '⚙️ [Etapa 4/4] Verificación de Compilación Next.js'
                echo '=================================================='
                script {
                    if (isUnix()) {
                        sh 'npm run build'
                    } else {
                        bat 'npm run build'
                    }
                }
            }
        }
    }

    post {
        success {
            echo '========================================================================'
            echo "✅ PIPELINE SUCCESSFUL: Auditoría aprobada para rama '${env.AUDITED_BRANCH ?: params.GIT_BRANCH}'."
            echo '   Listo para promoción automática a producción (main).'
            echo '========================================================================'
        }
        failure {
            echo '========================================================================'
            echo "❌ PIPELINE FAILED: Error detectado en rama '${env.AUDITED_BRANCH ?: params.GIT_BRANCH}'."
            echo '   Se bloquea el despliegue a producción.'
            echo '========================================================================'
        }
        always {
            cleanWs deleteDirs: true, notFailBuild: true
        }
    }
}

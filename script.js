(function() {
    'use strict';
    
    // Financial Tool Data Storage
    let financialToolData = {
        turnover: '',
        expenses: '',
        vehicleType: 'hybride',
        ownership: '',
        monthlyPayment: '',
        email: ''
    };

    // Initialize the financial tool
    function initFinancialTool() {
        setupEventListeners();
    }

    function populateForm() {
        // Populate inputs - store raw numbers without euro symbol
        document.getElementById('ft-turnover').value = financialToolData.turnover || '';
        document.getElementById('ft-expenses').value = financialToolData.expenses || '';
        document.getElementById('ft-monthly-payment').value = financialToolData.monthlyPayment || '';
        document.getElementById('ft-email').value = financialToolData.email || '';
        
        // Set vehicle type
        document.querySelectorAll('.ft-vehicle-option').forEach(option => {
            option.classList.remove('ft-selected');
            if (option.dataset.value === financialToolData.vehicleType) {
                option.classList.add('ft-selected');
            }
        });
        
        // Set custom dropdown and handle conditional field
        if (financialToolData.ownership) {
            const dropdownSelected = document.getElementById('ft-ownership-selected');
            const placeholder = dropdownSelected.querySelector('.ft-dropdown-placeholder');
            const ownershipInput = document.getElementById('ft-ownership');
            
            ownershipInput.value = financialToolData.ownership;
            placeholder.textContent = getOwnershipLabel(financialToolData.ownership);
            dropdownSelected.classList.add('ft-has-value');
            handleOwnershipChange(financialToolData.ownership);
        }
    }

    function setupEventListeners() {
        // Vehicle type selection
        const vehicleOptions = document.querySelectorAll('.ft-vehicle-option');
        vehicleOptions.forEach(option => {
            option.addEventListener('click', function() {
                vehicleOptions.forEach(opt => opt.classList.remove('ft-selected'));
                this.classList.add('ft-selected');
                const value = this.dataset.value;
                document.getElementById('ft-vehicleType').value = value;
                financialToolData.vehicleType = value;
            });
        });

        // Enhanced currency formatting for inputs
        const turnoverInput = document.getElementById('ft-turnover');
        const expensesInput = document.getElementById('ft-expenses');
        const monthlyPaymentInput = document.getElementById('ft-monthly-payment');

        [turnoverInput, expensesInput, monthlyPaymentInput].forEach(input => {
            // Handle input event for real-time formatting
            input.addEventListener('input', function(e) {
                handleCurrencyInput(this, e);
            });

            // Handle keydown for better backspace/delete handling
            input.addEventListener('keydown', function(e) {
                handleCurrencyKeydown(this, e);
            });

            input.addEventListener('blur', function() {
                const fieldName = this.id.replace('ft-', '').replace('-', '');
                // Store the raw numeric value without formatting
                if (fieldName === 'monthlypayment') {
                    financialToolData.monthlyPayment = extractNumericValue(this.value);
                } else {
                    financialToolData[fieldName] = extractNumericValue(this.value);
                }
            });

            // Handle focus to position cursor correctly
            input.addEventListener('focus', function() {
                // Move cursor to end of number part (before spaces)
                const value = this.value;
                const numericPart = value.replace(/\s/g, '');
                setTimeout(() => {
                    this.setSelectionRange(numericPart.length, numericPart.length);
                }, 0);
            });
        });

        // Custom dropdown handling
        const customDropdown = document.getElementById('ft-ownership-dropdown');
        const dropdownSelected = document.getElementById('ft-ownership-selected');
        const dropdownOptions = document.getElementById('ft-ownership-options');
        const ownershipInput = document.getElementById('ft-ownership');

        // Toggle dropdown
        dropdownSelected.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = customDropdown.classList.contains('ft-open');
            
            // Close all other dropdowns (if any)
            document.querySelectorAll('.ft-custom-dropdown.ft-open').forEach(dropdown => {
                dropdown.classList.remove('ft-open');
            });
            
            if (!isOpen) {
                customDropdown.classList.add('ft-open');
            }
        });

        // Handle option selection
        dropdownOptions.addEventListener('click', function(e) {
            if (e.target.classList.contains('ft-dropdown-option')) {
                const value = e.target.dataset.value;
                const text = e.target.textContent;
                
                // Update the display
                const placeholder = dropdownSelected.querySelector('.ft-dropdown-placeholder');
                placeholder.textContent = text;
                dropdownSelected.classList.add('ft-has-value');
                
                // Update the hidden input
                ownershipInput.value = value;
                financialToolData.ownership = value;
                
                // Handle conditional field
                handleOwnershipChange(value);
                
                // Close dropdown
                customDropdown.classList.remove('ft-open');
                
                // Clear any error
                dropdownSelected.classList.remove('ft-error');
                document.getElementById('ft-ownership-error').textContent = '';
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            customDropdown.classList.remove('ft-open');
        });

        // Keyboard support for dropdown
        dropdownSelected.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dropdownSelected.click();
            } else if (e.key === 'Escape') {
                customDropdown.classList.remove('ft-open');
            }
        });

        // Add tabindex for keyboard navigation
        dropdownSelected.setAttribute('tabindex', '0');

        // Email input
        const emailInput = document.getElementById('ft-email');
        emailInput.addEventListener('blur', function() {
            financialToolData.email = this.value;
        });

        // INCOM Info Box toggle functionality
        const incomInfoBox = document.getElementById('incomInfoBox');
        const incomInfoHeader = document.getElementById('incomInfoHeader');
        const incomInfoContent = document.getElementById('incomInfoContent');
        const incomInfoArrow = document.getElementById('incomInfoArrow');

        // Check if mobile
        function isMobile() {
            return window.innerWidth <= 768;
        }

        function initInfoBox() {
            if (isMobile()) {
                // Mobile: start collapsed
                incomInfoBox.classList.remove('mobile-expanded');
                incomInfoBox.classList.remove('collapsed');
                incomInfoArrow.textContent = '▼';
            } else {
                // Desktop: start expanded
                incomInfoBox.classList.remove('mobile-expanded');
                incomInfoBox.classList.remove('collapsed');
                incomInfoArrow.textContent = '▲';
            }
        }

        // Initialize on load
        initInfoBox();

        // Reinitialize on window resize
        window.addEventListener('resize', initInfoBox);

        if (incomInfoHeader && incomInfoBox) {
            incomInfoHeader.addEventListener('click', function() {
                // Only allow interaction on mobile
                if (!isMobile()) {
                    return; // Do nothing on desktop
                }
                
                // Mobile logic only
                const isExpanded = incomInfoBox.classList.contains('mobile-expanded');
                
                if (isExpanded) {
                    incomInfoBox.classList.remove('mobile-expanded');
                    incomInfoArrow.textContent = '▼';
                } else {
                    incomInfoBox.classList.add('mobile-expanded');
                    incomInfoArrow.textContent = '▲';
                }
            });
        }

        // Button handlers
        document.getElementById('ft-resultBtn').addEventListener('click', function() {
            validateAndSubmit();
        });

        // Restart button handler
        document.getElementById('ft-restartBtn').addEventListener('click', function() {
            restartSimulation();
        });

        // Download PDF button handler (placeholder)
        document.getElementById('ft-downloadBtn').addEventListener('click', function() {
            alert('Fonctionnalité PDF à venir !');
        });
    }

    function handleOwnershipChange(value) {
        const paymentGroup = document.getElementById('ft-payment-group');
        const paymentLabel = document.getElementById('ft-payment-label');
        const paymentInput = document.getElementById('ft-monthly-payment');
        
        if (value === 'credit' || value === 'leasing') {
            paymentGroup.style.display = 'block';
            if (value === 'credit') {
                paymentLabel.textContent = 'Montant mensuel du crédit';
                paymentInput.placeholder = '300';
            } else if (value === 'leasing') {
                paymentLabel.textContent = 'Montant mensuel du leasing';
                paymentInput.placeholder = '450';
            }
        } else {
            paymentGroup.style.display = 'none';
            paymentInput.value = '';
            financialToolData.monthlyPayment = '';
        }
    }

    function extractNumericValue(value) {
        return value.replace(/[^\d]/g, '');
    }

    function handleCurrencyKeydown(input, e) {
        const value = input.value;
        const cursorPos = input.selectionStart;
        
        // Allow navigation keys, backspace, delete, tab, etc.
        if ([8, 9, 27, 13, 46, 35, 36, 37, 38, 39, 40].indexOf(e.keyCode) !== -1 ||
            // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
            (e.keyCode === 65 && e.ctrlKey === true) ||
            (e.keyCode === 67 && e.ctrlKey === true) ||
            (e.keyCode === 86 && e.ctrlKey === true) ||
            (e.keyCode === 88 && e.ctrlKey === true)) {
            return;
        }
        
        // Ensure that it's a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    }

    function handleCurrencyInput(input, e) {
        // Get the current value and extract only digits
        let value = input.value.replace(/[^\d]/g, '');
        
        // If empty, just clear the input
        if (!value) {
            input.value = '';
            return;
        }
        
        // Convert to number and format with spaces for thousands
        const numericValue = parseInt(value);
        const formattedValue = numericValue.toLocaleString('fr-FR', {
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).replace(/,/g, ' '); // Replace commas with spaces for French formatting
        
        // Store cursor position before formatting
        const cursorPosition = input.selectionStart;
        const oldLength = input.value.length;
        
        // Set the formatted value
        input.value = formattedValue;
        
        // Adjust cursor position after formatting
        const newLength = input.value.length;
        const lengthDiff = newLength - oldLength;
        const newCursorPos = Math.max(0, Math.min(cursorPosition + lengthDiff, formattedValue.length));
        
        // Set cursor position
        setTimeout(() => {
            input.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    }

    function validateAndSubmit() {
        clearErrors();
        let isValid = true;

        // Update formData with current values - extract numeric values
        financialToolData.turnover = extractNumericValue(document.getElementById('ft-turnover').value);
        financialToolData.expenses = extractNumericValue(document.getElementById('ft-expenses').value);
        financialToolData.monthlyPayment = extractNumericValue(document.getElementById('ft-monthly-payment').value);
        financialToolData.email = document.getElementById('ft-email').value;
        financialToolData.ownership = document.getElementById('ft-ownership').value;

        // Validate turnover
        if (!financialToolData.turnover || financialToolData.turnover.trim() === '') {
            showError('ft-turnover', 'Le chiffre d\'affaires est requis');
            isValid = false;
        }

        // Validate ownership
        if (!financialToolData.ownership) {
            showError('ft-ownership', 'Veuillez sélectionner la titularité du véhicule');
            isValid = false;
        }

        // Validate monthly payment if credit or leasing is selected
        if ((financialToolData.ownership === 'credit' || financialToolData.ownership === 'leasing') && 
            (!financialToolData.monthlyPayment || financialToolData.monthlyPayment.trim() === '')) {
            showError('ft-monthly-payment', 'Le montant mensuel est requis');
            isValid = false;
        }

        // Validate expenses
        if (!financialToolData.expenses || financialToolData.expenses.trim() === '') {
            showError('ft-expenses', 'Le montant des frais professionnels est requis');
            isValid = false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!financialToolData.email || !emailRegex.test(financialToolData.email)) {
            showError('ft-email', 'Veuillez saisir une adresse email valide');
            isValid = false;
        }

        if (isValid) {
            calculateAndShowResults();
        } else {
            // Scroll to first error
            const firstError = document.querySelector('.ft-form-input.ft-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function calculateAndShowResults() {
        // Convert string values to numbers
        const caNetTTC = parseFloat(financialToolData.turnover) || 0;
        const fraisPro = parseFloat(financialToolData.expenses) || 0;
        const vehicleType = financialToolData.vehicleType;
        const ownership = financialToolData.ownership;
        const monthlyPayment = parseFloat(financialToolData.monthlyPayment) || 0;

        console.log('=== NOUVEAU CALCUL SELON LES SPÉCIFICATIONS ===');
        console.log('CA Net TTC:', caNetTTC);

        // 1. Calculate CA Brut TTC, TVA Due, and CA Net HT
        const caBrutTTC = caNetTTC / 0.7; // CA NET TTC ÷ 0.7
        const tvaDue = -(caBrutTTC * 0.10); // CA BRUT TTC × 10% (NEGATIVE)
        const caNetHT = caNetTTC + tvaDue; // CA NET TTC + TVA DUE (TVA Due is negative, so this is actually subtraction)
        
        console.log('CA Brut TTC (CA Net TTC ÷ 0.7):', caBrutTTC);
        console.log('TVA Due (CA Brut TTC × 10% - NEGATIVE):', tvaDue);
        console.log('CA Net HT (CA Net TTC + TVA Due):', caNetHT);

        // 2. Indemnité kilométrique
        let coefKm;
        let vehicleNote;
        switch(vehicleType) {
            case 'electrique':
                coefKm = 0.51240; // 51.240%
                vehicleNote = '(Électrique - 51.240%)';
                break;
            case 'hybride':
            case 'thermique':
            default:
                coefKm = 0.427; // 42.7%
                vehicleNote = vehicleType === 'hybride' ? '(Hybride - 42.7%)' : '(Thermique - 42.7%)';
                break;
        }
        const indemniteKm = -(coefKm * caNetTTC); // Negative because it's a deduction
        console.log(`Indemnité kilométrique ${vehicleNote}:`, indemniteKm);

        // 3. TVA déductible calculation
        // First part: 20% of vehicle cost if leasing or credit, 0 if owner or credit
        let tvaVehicle = 0;
        if (ownership === 'leasing') {
            tvaVehicle = monthlyPayment * 0.20;
        }
        // Note: For 'credit', vehicle TVA = 0 as specified

        // 20% on expense notes (frais pro)
        const tvaExpenses = fraisPro * 0.20;

        // 20% of CA Brut TTC (already calculated above)
        const tvaRecuperable = caBrutTTC * 0.20;

        // TVA déductible = minimum between the two calculations
        const tvaRecuperableTotal = tvaVehicle + tvaExpenses;
        const tvaDeductible = Math.min(tvaRecuperableTotal, tvaRecuperable);
        
        console.log('TVA véhicule (20% si leasing):', tvaVehicle);
        console.log('TVA frais pro (20%):', tvaExpenses);
        console.log('TVA récupérable (20% CA Brut TTC):', tvaRecuperable);
        console.log('TVA récupérable total:', tvaRecuperableTotal);
        console.log('TVA déductible (minimum):', tvaDeductible);

        // 4. Indemnité repas (negative amount - expense)
        const revenueRatio = caNetTTC / 100;
        let indemniteRepas;
        if (revenueRatio < 23) {
            indemniteRepas = -(revenueRatio * 21.1); // Negative because it's an expense
        } else {
            indemniteRepas = -(23 * 21.1); // Capped at 23 days, negative because it's an expense
        }
        console.log('Ratio CA/100:', revenueRatio);
        console.log('Indemnité repas (dépense):', indemniteRepas);

        // 5. Calculate final result: Salaire Brut Avant Impôts
        const salaireBrutAvantImpots = caNetHT + indemniteKm + tvaDeductible + indemniteRepas;

        // 6. Calculate Equivalent Unité d'Œuvre au SMIC and Salaire Net Avant Impôts
        const equivalentUniteOeuvre = salaireBrutAvantImpots / 13.84;
        const salaireNetAvantImpots = equivalentUniteOeuvre * 9.40;

        // 7. Calculate final allowances and Salaire Net
        const indemniteCongesPayes = equivalentUniteOeuvre * 1.19;
        const indemniteRuptureConventionnelle = equivalentUniteOeuvre * 0.25;
        // For Salaire Net calculation, all components are positive (absolute values)
        const salaireNet = salaireNetAvantImpots + Math.abs(indemniteKm) + Math.abs(indemniteRepas) + indemniteCongesPayes + indemniteRuptureConventionnelle;

        // Calculate percentage of CA Net TTC
        const pourcentageRestitution = Math.round((salaireNet / caNetTTC) * 100);
        
        console.log('=== CALCUL FINAL ===');
        console.log('CA Net HT:', caNetHT);
        console.log('Indemnité kilométrique (déduction):', indemniteKm);
        console.log('TVA déductible (ajout):', tvaDeductible);
        console.log('Indemnité repas (déduction):', indemniteRepas);
        console.log('SALAIRE BRUT AVANT IMPÔTS:', salaireBrutAvantImpots);
        console.log('Equivalent Unité d\'Œuvre au SMIC (÷ 13.84):', equivalentUniteOeuvre);
        console.log('SALAIRE NET AVANT IMPÔTS (Unité d\'Œuvre × 9.40):', salaireNetAvantImpots);
        console.log('Indemnités Congés Payés (Unité d\'Œuvre × 1.19):', indemniteCongesPayes);
        console.log('Indemnités Rupture Conventionnelle (Unité d\'Œuvre × 0.25):', indemniteRuptureConventionnelle);
        console.log('=== SALAIRE NET (TOUS POSITIFS) ===');
        console.log('Salaire Net Avant Impôts:', salaireNetAvantImpots);
        console.log('+ Indemnité kilométrique (abs):', Math.abs(indemniteKm));
        console.log('+ Indemnité repas (abs):', Math.abs(indemniteRepas));
        console.log('+ Indemnités Congés Payés:', indemniteCongesPayes);
        console.log('+ Indemnités Rupture Conventionnelle:', indemniteRuptureConventionnelle);
        console.log('SALAIRE NET FINAL:', salaireNet);
        console.log('POURCENTAGE DE RESTITUTION:', pourcentageRestitution + '%');

        // Display results
        displayResults({
            caNetTTC: caNetTTC,
            salaireBrutAvantImpots: salaireBrutAvantImpots,
            salaireNetAvantImpots: salaireNetAvantImpots,
            indemniteKm: indemniteKm,
            indemniteRepas: indemniteRepas,
            indemniteCongesPayes: indemniteCongesPayes,
            indemniteRuptureConventionnelle: indemniteRuptureConventionnelle,
            salaireNet: salaireNet,
            pourcentageRestitution: pourcentageRestitution
        });
    }

    function displayResults(results) {
        // Hide the form text content (heading and info box)
        const formTextContent = document.getElementById('formTextContent');
        if (formTextContent) {
            formTextContent.style.display = 'none';
        }

        // Calculate comparison values
        // INCOM salary (with benefits)
        const incomSalary = results.salaireNet;
        const incomPercentage = results.pourcentageRestitution;

        // Update comparison cards
        document.getElementById('result-incom-amount').textContent = formatEuro(incomSalary);
        document.getElementById('result-incom-percentage').textContent = `${incomPercentage} % de restitution`;

        // Update salary components
        document.getElementById('component-salaire-net').textContent = formatEuro(results.salaireNetAvantImpots);
        document.getElementById('component-salaire-net-monthly').textContent = formatEuro(results.salaireNetAvantImpots);

        document.getElementById('component-indemnites-km').textContent = formatEuro(Math.abs(results.indemniteKm));
        document.getElementById('component-indemnites-km-monthly').textContent = formatEuro(Math.abs(results.indemniteKm));

        document.getElementById('component-indemnites-repas').textContent = formatEuro(Math.abs(results.indemniteRepas));
        document.getElementById('component-indemnites-repas-monthly').textContent = formatEuro(Math.abs(results.indemniteRepas));

        document.getElementById('component-conges-payes').textContent = formatEuro(results.indemniteCongesPayes);
        document.getElementById('component-conges-payes-monthly').textContent = formatEuro(results.indemniteCongesPayes);

        document.getElementById('component-rupture-conventionnelle').textContent = formatEuro(results.indemniteRuptureConventionnelle);
        document.getElementById('component-rupture-conventionnelle-monthly').textContent = formatEuro(results.indemniteRuptureConventionnelle);

        // Hide form and show results
        document.getElementById('formSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
    }

    function formatEuro(value) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    function restartSimulation() {
        // Show the form text content again
        const formTextContent = document.getElementById('formTextContent');
        if (formTextContent) {
            formTextContent.style.display = 'block';
        }

        // Reset form data
        financialToolData = {
            turnover: '',
            expenses: '',
            vehicleType: 'hybride',
            ownership: '',
            monthlyPayment: '',
            email: ''
        };

        // Clear form inputs
        document.getElementById('ft-turnover').value = '';
        document.getElementById('ft-expenses').value = '';
        document.getElementById('ft-monthly-payment').value = '';
        document.getElementById('ft-email').value = '';
        document.getElementById('ft-ownership').value = '';

        // Reset dropdown
        const dropdownSelected = document.getElementById('ft-ownership-selected');
        const placeholder = dropdownSelected.querySelector('.ft-dropdown-placeholder');
        placeholder.textContent = 'Sélectionnez une option';
        dropdownSelected.classList.remove('ft-has-value');

        // Reset vehicle selection
        document.querySelectorAll('.ft-vehicle-option').forEach(option => {
            option.classList.remove('ft-selected');
            if (option.dataset.value === 'hybride') {
                option.classList.add('ft-selected');
            }
        });
        document.getElementById('ft-vehicleType').value = 'hybride';

        // Hide payment group
        document.getElementById('ft-payment-group').style.display = 'none';

        // Clear errors
        clearErrors();

        // Show form and hide results
        document.getElementById('formSection').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    function formatDisplayValue(value) {
        if (!value) return '';
        const numericValue = parseInt(value);
        return numericValue.toLocaleString('fr-FR');
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + '-error');
        
        if (fieldId === 'ft-ownership') {
            // Handle custom dropdown error styling
            const dropdownSelected = document.getElementById('ft-ownership-selected');
            if (dropdownSelected) {
                dropdownSelected.classList.add('ft-error');
            }
        } else if (field) {
            field.classList.add('ft-error');
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }

    function clearErrors() {
        const errorElements = document.querySelectorAll('.ft-error-message');
        const inputElements = document.querySelectorAll('.ft-form-input');
        const dropdownSelected = document.getElementById('ft-ownership-selected');
        
        errorElements.forEach(el => el.textContent = '');
        inputElements.forEach(el => el.classList.remove('ft-error'));
        
        if (dropdownSelected) {
            dropdownSelected.classList.remove('ft-error');
        }
    }

    function getOwnershipLabel(value) {
        const labels = {
            'owner': 'Propriétaire',
            'credit': 'Crédit véhicule (financement)',
            'leasing': 'Leasing / Location longue durée'
        };
        return labels[value] || value;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFinancialTool);
    } else {
        initFinancialTool();
    }
})();
